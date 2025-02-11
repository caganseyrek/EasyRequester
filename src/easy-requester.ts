import type { BaseResponse, ClientConfig, RequestConfig } from "./globals";

import RequestQueuer from "./handlers/requestQueuer";
import RequestAborter from "./handlers/requestAborter";

import Generators from "./utils/generator";
import Debugger from "./utils/debugger";

/**
 * EasyRequester class that provides a simplified interface to make HTTP requests.
 * It manages request configuration, queuing, and aborting.
 */
class EasyRequester {
  private POSSIBLE_STATUS_CODES: number[] = [200, 201, 202, 203, 204, 205, 206];

  private clientConfig: ClientConfig;
  private requestQueuer: RequestQueuer = new RequestQueuer();
  private requestAborter: RequestAborter = new RequestAborter();

  /**
   * Initializes the EasyRequester with the provided client configuration.
   *
   * @param {ClientConfig} clientConfig - The configuration to initialize the client.
   */
  constructor(clientConfig: ClientConfig) {
    this.clientConfig = {
      onNewRequest: clientConfig.onNewRequest ?? "enqueue-new",
      acceptStatusCodes: Array.from(
        new Set([...this.POSSIBLE_STATUS_CODES, ...(clientConfig.acceptStatusCodes ?? [])]),
      ),
      isDebugMode: clientConfig.isDebugMode ?? false,
    };
    Debugger.log("EasyRequestre Constructor", "EasyRequester is initialized with client config.");
  }

  /**
   * Sets up the request configuration and returns a ConfiguredRequester instance.
   *
   * @param {RequestConfig} requestConfig - The configuration for a request.
   * @returns {ConfiguredRequester} The configured requester instance.
   */
  public setRequestConfig(requestConfig: RequestConfig): ConfiguredRequester {
    const newRequestConfig: RequestConfig = {
      url: {
        protocol: requestConfig.url.protocol ?? "http",
        baseURL: requestConfig.url.baseURL,
        port: requestConfig.url.port,
        endpoint: requestConfig.url.endpoint,
        query: requestConfig.url.query,
      },
      method: requestConfig.method,
      ...(requestConfig.header && {
        header: {
          contentType: requestConfig.header.contentType ?? "Content-Type: application/json",
          responseLang: requestConfig.header.responseLang,
          headers: requestConfig.header.headers ?? {},
        },
      }),
      ...(requestConfig.auth && {
        auth: {
          accessToken: requestConfig.auth.accessToken,
          includeCookies: requestConfig.auth.includeCookies ?? false,
        },
      }),
    };
    Debugger.log(this.setRequestConfig.name, "Request config set up.");
    return new ConfiguredRequester(newRequestConfig, this.clientConfig, this.requestQueuer, this.requestAborter);
  }
}

class ConfiguredRequester {
  private requestConfig!: RequestConfig;
  private clientConfig: ClientConfig;
  private requestQueuer: RequestQueuer;
  private requestAborter: RequestAborter;

  /**
   * Initializes the ConfiguredRequester with request and client configurations, queuer, and aborter.
   *
   * @param {RequestConfig} requestConfig - The configuration for a request.
   * @param {ClientConfig} clientConfig - The configuration for the client.
   * @param {RequestQueuer} requestQueuer - The request queuer instance.
   * @param {RequestAborter} requestAborter - The request aborter instance.
   */
  constructor(
    requestConfig: RequestConfig,
    clientConfig: ClientConfig,
    requestQueuer: RequestQueuer,
    requestAborter: RequestAborter,
  ) {
    this.requestConfig = requestConfig;
    this.clientConfig = clientConfig;
    this.requestQueuer = requestQueuer;
    this.requestAborter = requestAborter;

    Debugger.log("ConfiguredRequester Constuctor", "ConfiguredRequester is initialized.");
  }

  /**
   * Sends the request with the configured settings and payload.
   *
   * @template TResponse - The expected response type.
   * @template TPayload - The type of the payload to send with the request.
   *
   * @param {TPayload} payload - The payload to send in the request body.
   * @returns {Promise<TResponse>} The response from the request.
   *  * The response is expected to be of type `TResponse`, which extends `BaseResponse` and includes:
   * - `isSuccess`: A boolean indicating whether the request was successful.
   * - `message`: An optional string containing any error message or additional info.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async sendRequest<TResponse extends BaseResponse = any, TPayload = any>(
    payload: TPayload,
  ): Promise<TResponse> {
    const generatedURL: string = Generators.generateURL(this.requestConfig.url);
    const generatedHeaders: HeadersInit = Generators.generateHeaders({
      contentType: this.requestConfig.header?.contentType,
      responseLang: this.requestConfig.header?.responseLang,
      customHeaders: this.requestConfig.header?.headers,
    });

    const requestFn = async () => {
      try {
        const requestConfig: RequestInit = {
          method: this.requestConfig.method,
          credentials: this.requestConfig.auth?.includeCookies ? "include" : "same-origin",
          headers: generatedHeaders,
        };

        if (this.clientConfig.onNewRequest === "abort-previous") {
          Debugger.log(requestFn.name, "Controllers for request aborter is set up.");
          this.requestAborter.setupAbortController(generatedURL, requestConfig);
        }

        /**
         * Skip adding request body if request method is either 'GET' or 'HEAD'.
         * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET
         * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD
         */
        if (!["GET", "HEAD"].includes(this.requestConfig.method)) {
          Debugger.log(requestFn.name, "Added request body due to method NOT being 'GET' or 'HEAD'");
          requestConfig.body = JSON.stringify(payload);
        }
        Debugger.log(requestFn.name, "Sending request...");
        const response = await fetch(generatedURL, requestConfig);

        if (this.clientConfig.acceptStatusCodes && this.clientConfig.acceptStatusCodes.includes(response.status)) {
          Debugger.log(requestFn.name, "Successfully received a response with an expected status code");

          if (response.headers.get("content-type")?.includes("application/json")) {
            Debugger.log(requestFn.name, "Resolved response message as JSON");
            return (await response.json()) as TResponse;
          }
          Debugger.log(requestFn.name, "Resolved response message as text");
          return (await response.text()) as unknown as TResponse;
        }

        Debugger.log(requestFn.name, "Received a response with an unexpected status code");

        if (this.clientConfig.onNewRequest === "abort-previous") {
          Debugger.log(requestFn.name, "Deleted request aborder controllers.");
          this.requestAborter.getControllers().delete(generatedURL);
        }
        return { isSuccess: false } as TResponse;
      } catch (error) {
        Debugger.error(requestFn.name, `An error ocurred during request ${error}`);

        if (this.clientConfig.onNewRequest === "abort-previous") {
          Debugger.log(requestFn.name, "Deleted request aborder controllers.");
          this.requestAborter.handleAbortError(generatedURL);
        }
        return { isSuccess: false, message: error } as TResponse;
      }
    };
    if (this.clientConfig.onNewRequest === "enqueue-new") {
      Debugger.log(requestFn.name, "Request enqueued");
      return this.requestQueuer.enqueueRequest(requestFn);
    }
    return requestFn();
  }
}

export default EasyRequester;
