import type { ClientConfig, RequestConfig } from "../types/globals";

import RequestQueuer from "@/core/handlers/requestQueuer";
import RequestAborter from "@/core/handlers/requestAborter";

import Logger from "@/utils/logger";

import ConfiguredRequester from "./configuredRequester";

/**
 * EasyRequester class that provides a simplified interface to make HTTP requests.
 * It manages request configuration, queuing, and aborting.
 */
class BaseRequester {
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
    Logger.info("EasyRequestre Constructor", "EasyRequester is initialized with client config.");
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
    Logger.info(this.setRequestConfig.name, "Request config set up.");
    return new ConfiguredRequester(newRequestConfig, this.clientConfig, this.requestQueuer, this.requestAborter);
  }
}

export default BaseRequester;
