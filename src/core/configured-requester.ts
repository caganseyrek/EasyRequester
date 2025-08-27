import { ConcurrencyManager } from "@/core/concurrency-manager";

import type { EasyRequesterConfig, PerRequestConfig } from "@/globals";

interface ResponseProps<TData> {
  success: boolean;
  message?: string;
  data: TData | null;
}

class ConfiguredRequester {
  private concurrencyManager: ConcurrencyManager;

  private easyRequesterConfig: EasyRequesterConfig;
  private perRequestConfig: PerRequestConfig;

  constructor(easyRequesterConfig: EasyRequesterConfig, perRequestConfig: PerRequestConfig) {
    this.concurrencyManager = new ConcurrencyManager();

    this.easyRequesterConfig = easyRequesterConfig;
    this.perRequestConfig = perRequestConfig;
  }

  private generateHeadersForRequest(): HeadersInit {
    return (
      this.perRequestConfig.headers
        ? {
            ...(this.perRequestConfig.headers.customHeaders ? this.perRequestConfig.headers.customHeaders : {}),
            "Content-Type": this.perRequestConfig.headers.contentType ?? "application/json",

            ...(this.perRequestConfig.headers.responseLang && {
              "Accept-Language": this.perRequestConfig.headers.responseLang,
            }),

            ...(this.perRequestConfig.auth?.accessToken && {
              Authorization: `Bearer ${this.perRequestConfig.auth?.accessToken}`,
            }),
          }
        : {}
    ) as HeadersInit;
  }

  private generateRequestUrl(): string {
    const baseUrl: string = this.perRequestConfig.overrideBaseUrl
      ? this.perRequestConfig.overrideBaseUrl
      : this.easyRequesterConfig.baseUrl;

    return `${baseUrl.replace(/\/+$/, "")}/${this.perRequestConfig.endpoint.replace(/^\/+/, "")}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async sendRequest<TResponse = any, TPayload = any>(payload: TPayload): Promise<ResponseProps<TResponse>> {
    const generatedUrl: string = this.generateRequestUrl();
    const generatedHeaders: HeadersInit = this.generateHeadersForRequest();

    const requestFn = async (): Promise<ResponseProps<TResponse>> => {
      try {
        const requestConfig: RequestInit = {
          method: this.perRequestConfig.method,
          headers: generatedHeaders,
          credentials:
            this.perRequestConfig.auth && this.perRequestConfig.auth.includeCookies ? "include" : "same-origin",
        };

        if (this.easyRequesterConfig.onNewRequest === "abort-previous") {
          this.concurrencyManager.requestAborter.setupAbortController(generatedUrl, requestConfig);
        }

        /**
         * Skip adding request body if request method is either 'GET' or 'HEAD'.
         * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET
         * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD
         */
        if (!["GET", "HEAD"].includes(this.perRequestConfig.method)) {
          requestConfig.body = JSON.stringify(payload);
        }

        const response = await fetch(generatedUrl, requestConfig);
        if (!response.ok) {
          if (this.easyRequesterConfig.onNewRequest === "abort-previous") {
            this.concurrencyManager.requestAborter.getControllers().delete(generatedUrl);
          }
          throw new Error(response.statusText);
        }

        const formattedResponse: ResponseProps<TResponse> = {
          success: true,
          message: response.statusText,
          data: response.headers.get("content-type")?.includes("application/json")
            ? await response.json()
            : await response.text(),
        };

        return formattedResponse;
      } catch (error) {
        if (this.easyRequesterConfig.onNewRequest === "abort-previous") {
          this.concurrencyManager.requestAborter.handleAbortError(generatedUrl);
        }

        const formattedResponse: ResponseProps<TResponse> = {
          success: false,
          message: error instanceof Error ? error.name : "An unknown error occurred during request.",
          data: null,
        };
        return formattedResponse;
      }
    };

    if (this.easyRequesterConfig.onNewRequest === "enqueue-new") {
      return this.concurrencyManager.requestQueuer.enqueueRequest(requestFn);
    }
    return await requestFn();
  }
}

export { ConfiguredRequester };
