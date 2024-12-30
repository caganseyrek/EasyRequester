import type { EasyRequesterConfig } from ".";
import type InternalTypes from "./types/internal";

import Generators from "./utils/generators";
import Validator from "./utils/validator";
import Debugger from "./utils/debugger";

class EasyRequester {
  private POSSIBLE_STATUS_CODES: number[] = [200, 201, 202, 203, 204, 205, 206];
  private requesterParams: InternalTypes.RequesterParams = {
    requestURLParams: {
      protocol: "https",
      baseURL: "",
      port: undefined,
      endpoint: "",
      query: undefined,
    },
    requestHeaderParams: {
      method: "POST",
      contentType: "application/json",
      responseLang: undefined,
      customHeaders: undefined,
      generatedHeaders: undefined,
    },
    requestAuthParams: {
      accessToken: undefined,
      includeCookies: false,
    },
    requestPayload: {},
    responseDetailsParams: {
      possibleStatusCodes: this.POSSIBLE_STATUS_CODES,
    },
  };
  private isDebugMode: boolean = false;

  constructor() {}

  /**
   * Sets up the configuration for the EasyRequester instance.
   * @param {EasyRequesterConfig} requesterConfig
   * @returns The EasyRequester instance for chaining.
   * @throws {Error} If required configuration fields are missing or invalid.
   * @example new EasyRequester.setConfig({ ...config });
   */
  public setConfig(requesterConfig: EasyRequesterConfig): EasyRequester {
    Debugger.log("Setting up request config...");
    this.requesterParams = {
      requestURLParams: {
        protocol: requesterConfig.protocol ?? this.requesterParams.requestURLParams.protocol,
        baseURL: requesterConfig.baseURL.replace(/\/$/, ""),
        port: requesterConfig.port,
        endpoint: requesterConfig.endpoint,
        query: requesterConfig.query,
      },
      requestHeaderParams: {
        method: requesterConfig.method,
        contentType: requesterConfig.contentType ?? this.requesterParams.requestHeaderParams.contentType,
        responseLang: requesterConfig.responseLang,
        customHeaders: requesterConfig.customHeaders ?? {},
      },
      requestAuthParams: {
        accessToken: requesterConfig.accessToken,
        includeCookies: requesterConfig.includeCookies,
      },
      requestPayload: requesterConfig.payload,
      responseDetailsParams: {
        possibleStatusCodes: requesterConfig.possibleStatusCodes
          ? this.requesterParams.responseDetailsParams.possibleStatusCodes.concat(requesterConfig.possibleStatusCodes)
          : this.requesterParams.responseDetailsParams.possibleStatusCodes,
      },
    };
    Debugger.log("Done setting up request config...");
    Validator.validateConfig({
      protocol: this.requesterParams.requestURLParams.protocol,
      baseURL: this.requesterParams.requestURLParams.baseURL,
      port: this.requesterParams.requestURLParams.port,
      endpoint: this.requesterParams.requestURLParams.endpoint,
      contentType: this.requesterParams.requestHeaderParams.contentType,
      accessToken: this.requesterParams.requestAuthParams.accessToken,
      responseLang: this.requesterParams.requestHeaderParams.responseLang,
    });
    return this;
  }

  /**
   * Toggles debug mode for logging request and requester instance details.
   * @param {boolean} [isToggled=false] **Optional**
   * @description If true, enables debug logging. Defaults to `false`.
   * @returns {EasyRequester} The EasyRequester instance for chaining.
   * @example
   * ew EasyRequester.debugMode(true);
   */
  public debugMode(isToggled: boolean = false): EasyRequester {
    this.isDebugMode = isToggled;
    Debugger.setDebugMode(this.isDebugMode);
    Debugger.log(`Debug mode is set to ${this.isDebugMode}`);
    return this;
  }

  /**
   * Sends an HTTP request using the configured settings.
   * @template TResponse - Type of the expected response data.
   * @template TPayload - Type of the payload data.
   * @requires `setConfig()` to set the request configuration.
   * @returns {Promise<TResponse>} A promise with response object that is typeof TResponse.
   * @throws `Error` For HTTP requests that does not match the possible status codes.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async sendRequest<TResponse = any, TPayload = any>(): Promise<TResponse> {
    const generatedURL: string = Generators.generateURL(this.requesterParams.requestURLParams);
    const requestConfig: RequestInit = {};
    try {
      Debugger.log("Trying to send request...");
      requestConfig.method = this.requesterParams.requestHeaderParams.method;
      requestConfig.headers = this.requesterParams.requestHeaderParams.generatedHeaders as HeadersInit;
      requestConfig.credentials = this.requesterParams.requestAuthParams.includeCookies ? "include" : "same-origin";

      /**
       * Skip adding request body if request method is either 'GET' or 'HEAD'.
       * See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET
       * See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD
       */
      if (
        this.requesterParams.requestHeaderParams.method !== "GET" &&
        this.requesterParams.requestHeaderParams.method !== "HEAD"
      ) {
        requestConfig.body = JSON.stringify(this.requesterParams.requestPayload as TPayload);
        Debugger.log("Added request body.");
      }
      Debugger.log("Skipped adding request body due to request method being 'GET' or 'HEAD'");

      const response = await fetch(generatedURL, requestConfig);
      if (
        this.requesterParams.responseDetailsParams.possibleStatusCodes &&
        this.requesterParams.responseDetailsParams.possibleStatusCodes.includes(response.status)
      ) {
        /**
         * Resolve response data, if the response's status code is among POSSIBLE_STATUS_CODES,
         * or among the additional status codes which is set with the setConfig method.
         */
        Debugger.log(
          `Resolving response data. Response status code is ${response.status} which is among possible status codes.`,
        );
        const responseData: TResponse = await response.json();
        Debugger.log("Successfully resolved response.");
        return responseData;
      }
      /**
       * Return null if the status codes is not among the possible response status codes.
       */
      const responseMessage: TResponse = await response.json();
      Debugger.error(
        `Request failed with status: ${response.status} - ${response.statusText} with a message ${responseMessage}`,
      );
      return null as TResponse;
    } catch (error) {
      Debugger.error((error as Error).message);
      return null as TResponse;
    }
  }
}

/**
 * @description EasyRequester is a customizable HTTP requester and request handler with detailed configuration. See https://github.com/caganseyrek/EasyRequester for more info and details about how to use.
 */
export default EasyRequester;
