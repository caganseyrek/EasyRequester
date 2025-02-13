import type { GenerateEndpointParams, GenerateHeaderParams, GenerateURLParams } from "@/types/internals";

import Logger from "./logger";

class Generator {
  private constructor() {}

  /**
   * Generates an endpoint string from an object or string.
   * If the `endpoint` is an object, each key-value pair will be converted to a path segment.
   * If it's a string, it is sanitized and returned as a single path segment.
   *
   * @private
   * @param {GenerateEndpointParams} generateEndpointParams - The parameters to generate the endpoint.
   * @param {GenerateEndpointParams["endpoint"]} generateEndpointParams.endpoint - The endpoint or path to generate.
   * @returns {string} The generated endpoint string.
   */
  private static generateEndpoint(generateEndpointParams: GenerateEndpointParams): string {
    let endpoint: string = "";
    if (typeof generateEndpointParams.endpoint === "object") {
      Object.entries(generateEndpointParams.endpoint).forEach(([key, value]) => {
        if (typeof value !== "string") {
          Logger.error(this.generateEndpoint.name, `Expected value for key "${key}" to be typeof 'string'.`);
        }
        const sanitizedValue = value.replace(/^\/|\/$/g, "");
        endpoint += `/${sanitizedValue}`;
      });
      Logger.info(this.generateEndpoint.name, `Generating endpoint from object: ${JSON.stringify(endpoint)}`);
      return endpoint;
    }
    endpoint = "/" + generateEndpointParams.endpoint.replace(/^\/|\/$/g, "");
    Logger.info(this.generateEndpoint.name, `Generating endpoint from string: ${JSON.stringify(endpoint)}`);
    return endpoint;
  }

  /**
   * Generates a complete URL from the provided parameters.
   * It combines the protocol, base URL, port, endpoint, and query parameters to form the full URL.
   *
   * @param {GenerateURLParams} generateURLParams - The parameters to generate the URL.
   * @param {GenerateURLParams["protocol"]} generateURLParams.protocol - The protocol (e.g., "http").
   * @param {GenerateURLParams["baseURL"]} generateURLParams.baseURL - The base URL (e.g., "example.com").
   * @param {GenerateURLParams["port"]} [generateURLParams.port] - The optional port number.
   * @param {GenerateURLParams["endpoint"]} generateURLParams.endpoint - The endpoint or path to append.
   * @param {GenerateURLParams["query"]} [generateURLParams.query] - Optional query parameters as a record.
   * @returns {string} The generated full URL.
   */
  public static generateURL(generateURLParams: GenerateURLParams): string {
    const urlString: string = `${generateURLParams.protocol}://${generateURLParams.baseURL}${generateURLParams.port ? `:${generateURLParams.port}` : ""}`;
    const endpointString: string = this.generateEndpoint({ endpoint: generateURLParams.endpoint });
    const queryString: string = generateURLParams.query
      ? `?${new URLSearchParams(generateURLParams.query).toString()}`
      : "";

    const generatedURL: string = `${urlString}${endpointString}${queryString}`;
    Logger.info(this.generateURL.name, `Generated request URL: ${generatedURL}`);
    return generatedURL;
  }

  /**
   * Generates the headers for an HTTP request.
   * The headers are generated based on the provided parameters, including optional authorization and content-type.
   *
   * @param {GenerateHeaderParams} generateHeaderParams - The parameters to generate the headers.
   * @param {GenerateHeaderParams["contentType"]} [generateHeaderParams.contentType] - The content type header (defaults to "application/json").
   * @param {GenerateHeaderParams["accessToken"]} [generateHeaderParams.accessToken] - The optional access token for authorization.
   * @param {GenerateHeaderParams["responseLang"]} [generateHeaderParams.responseLang] - The optional language for the response.
   * @param {GenerateHeaderParams["customHeaders"]} [generateHeaderParams.customHeaders] - Optional custom headers.
   * @returns {HeadersInit} The generated headers as a `HeadersInit` object.
   */
  public static generateHeaders(generateHeaderParams: GenerateHeaderParams): HeadersInit {
    const generatedHeaders: Record<string, string> = {
      ...generateHeaderParams.customHeaders,
      "Content-Type": generateHeaderParams.contentType ?? "application/json",
      ...(generateHeaderParams.accessToken && {
        Authorization: `Bearer ${generateHeaderParams.accessToken}`,
      }),
      ...(generateHeaderParams.responseLang && { "Accept-Language": generateHeaderParams.responseLang }),
    };
    Logger.info(this.generateHeaders.name, `Generated headers: ${JSON.stringify(generatedHeaders)}`);
    return generatedHeaders as HeadersInit;
  }
}

export default Generator;
