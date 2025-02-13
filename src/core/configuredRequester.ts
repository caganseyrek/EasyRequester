import type { RequestConfig, ClientConfig, BaseResponse } from "@/types/globals";

import RequestAborter from "@/handlers/requestAborter";
import RequestQueuer from "@/handlers/requestQueuer";

import Logger from "@/utils/logger";
import Generators from "@/utils/generator";

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

    Logger.info("ConfiguredRequester Constuctor", "ConfiguredRequester is initialized.");
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
          Logger.info(requestFn.name, "Controllers for request aborter is set up.");
          this.requestAborter.setupAbortController(generatedURL, requestConfig);
        }

        /**
         * Skip adding request body if request method is either 'GET' or 'HEAD'.
         * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET
         * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD
         */
        if (!["GET", "HEAD"].includes(this.requestConfig.method)) {
          Logger.info(requestFn.name, "Added request body due to method NOT being 'GET' or 'HEAD'");
          requestConfig.body = JSON.stringify(payload);
        }
        Logger.info(requestFn.name, "Sending request...");
        const response = await fetch(generatedURL, requestConfig);

        if (this.clientConfig.acceptStatusCodes && this.clientConfig.acceptStatusCodes.includes(response.status)) {
          Logger.info(requestFn.name, "Successfully received a response with an expected status code");

          if (response.headers.get("content-type")?.includes("application/json")) {
            Logger.info(requestFn.name, "Resolved response message as JSON");
            return {
              isSuccess: true,
              message: response.statusText,
              ...(await response.json()),
            } as TResponse;
          }
          Logger.info(requestFn.name, "Resolved response message as text");
          return {
            isSuccess: true,
            message: response.statusText,
            text: await response.text(),
          } as unknown as TResponse;
        }

        Logger.info(requestFn.name, "Received a response with an unexpected status code");

        if (this.clientConfig.onNewRequest === "abort-previous") {
          Logger.info(requestFn.name, "Deleted request aborder controllers.");
          this.requestAborter.getControllers().delete(generatedURL);
        }
        return { isSuccess: false } as TResponse;
      } catch (error) {
        Logger.error(requestFn.name, `An error ocurred during request ${error}`);

        if (this.clientConfig.onNewRequest === "abort-previous") {
          Logger.info(requestFn.name, "Deleted request aborder controllers.");
          this.requestAborter.handleAbortError(generatedURL);
        }
        return { isSuccess: false, message: error } as TResponse;
      }
    };
    if (this.clientConfig.onNewRequest === "enqueue-new") {
      Logger.info(requestFn.name, "Request enqueued");
      return this.requestQueuer.enqueueRequest(requestFn);
    }
    return requestFn();
  }
}

export default ConfiguredRequester;
