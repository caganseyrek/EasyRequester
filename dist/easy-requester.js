class Debugger {
  static isDebugMode = false;
  constructor() {}
  static setDebugMode(debugMode) {
    this.isDebugMode = debugMode;
  }
  /**
   * Logs a debug message to the console when debug mode is enabled.
   * The message will include the specified location and message.
   *
   * @param {string} location - The location (e.g., method name) where the log is being generated.
   * @param {string} debugMessage - The debug message to log.
   * @returns {void}
   */
  static log(location, debugMessage) {
    if (this.isDebugMode) {
      // eslint-disable-next-line no-console
      console.debug(`[EasyRequester_DEBUG] ${debugMessage} at ${location}`);
    }
  }
  /**
   * Logs an error message to the console and throws an error when debug mode is enabled.
   * The message will include the specified location and error message.
   *
   * @param {string} location - The location (e.g., method name) where the error occurred.
   * @param {string} errorMessage - The error message to log.
   * @throws {Error} Throws a new `Error` with the provided error message.
   * @returns {void}
   */
  static error(location, errorMessage) {
    if (this.isDebugMode) {
      // eslint-disable-next-line no-console
      console.debug(`[EasyRequester_ERROR] ${errorMessage} at ${location}`);
    }
    throw new Error(`EasyRequesterError: ${errorMessage} at ${location}`);
  }
}

/**
 * A utility class to manage a queue of requests.
 * This class ensures that requests are processed sequentially, preventing multiple concurrent requests.
 */
class RequestQueuer {
  requestQueue = [];
  isRequestInProgress = false;
  constructor() {}
  /**
   * Processes the next request in the queue.
   * If a request is already in progress or the queue is empty, the method will return early.
   * Otherwise, it will execute the next request and handle its result or error.
   *
   * @private
   * @returns {Promise<void>} Resolves when the queue processing is complete.
   */
  async processQueue() {
    if (this.isRequestInProgress || this.requestQueue.length === 0) {
      return;
    }
    const { requestFn, resolve, reject } = this.requestQueue.shift();
    this.isRequestInProgress = true;
    Debugger.log(requestFn.name, "Processing request queue");
    try {
      const response = await requestFn();
      resolve(response);
    } catch (error) {
      reject(error);
    } finally {
      this.isRequestInProgress = false;
      this.processQueue();
    }
  }
  /**
   * Enqueues a request to be processed in the queue.
   * This method wraps the request function in a `Promise` and adds it to the queue.
   * It ensures requests are processed one at a time.
   *
   * @param {() => Promise<TResponse>} requestFn - A function that returns a promise, representing the request to be processed.
   * @returns {Promise<TResponse>} A promise that resolves with the response of the request.
   */
  enqueueRequest(requestFn) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }
}

/**
 * A utility class to manage aborting requests using `AbortController`.
 * This class ensures that only the latest request for a given URL is active,
 * and any previous requests are aborted when a new one is initiated.
 */
class RequestAborter {
  controllers;
  abortController;
  constructor() {
    this.controllers = new Map();
  }
  /**
   * Gets the map of controllers currently managing active requests.
   * The key is the generated URL for each request, and the value is the corresponding `AbortController`.
   *
   * @returns {Map<string, AbortController>} The map of controllers for active requests.
   */
  getControllers() {
    return this.controllers;
  }
  /**
   * Sets up an `AbortController` for a new request.
   * If there is already an active request for the same URL, the previous request will be aborted.
   *
   * @param {string} generatedURL - The URL associated with the request.
   * @param {RequestInit} requestConfig - The configuration object for the request, where `signal` will be set to the `AbortController` signal.
   *
   * @returns {void}
   */
  setupAbortController(generatedURL, requestConfig) {
    this.abortController = new AbortController();
    requestConfig.signal = this.abortController.signal;
    if (this.controllers.has(generatedURL)) {
      Debugger.log(this.setupAbortController.name, "Aborted previous request due to being received a new request.");
      const previousController = this.controllers.get(generatedURL);
      previousController?.abort();
    }
    this.controllers.set(generatedURL, this.abortController);
  }
  /**
   * Handles the cleanup of aborted requests by removing the controller from the map.
   *
   * @param {string} generatedURL - The URL of the aborted request.
   *
   * @returns {void}
   */
  handleAbortError(generatedURL) {
    this.getControllers().delete(generatedURL);
  }
}

class Generator {
  constructor() {}
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
  static generateEndpoint(generateEndpointParams) {
    let endpoint = "";
    if (typeof generateEndpointParams.endpoint === "object") {
      Object.entries(generateEndpointParams.endpoint).forEach(([key, value]) => {
        if (typeof value !== "string") {
          Debugger.error(this.generateEndpoint.name, `Expected value for key "${key}" to be typeof 'string'.`);
        }
        const sanitizedValue = value.replace(/^\/|\/$/g, "");
        endpoint += `/${sanitizedValue}`;
      });
      Debugger.log(this.generateEndpoint.name, `Generating endpoint from object: ${JSON.stringify(endpoint)}`);
      return endpoint;
    }
    endpoint = "/" + generateEndpointParams.endpoint.replace(/^\/|\/$/g, "");
    Debugger.log(this.generateEndpoint.name, `Generating endpoint from string: ${JSON.stringify(endpoint)}`);
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
  static generateURL(generateURLParams) {
    const urlString = `${generateURLParams.protocol}://${generateURLParams.baseURL}${generateURLParams.port ? `:${generateURLParams.port}` : ""}`;
    const endpointString = this.generateEndpoint({ endpoint: generateURLParams.endpoint });
    const queryString = generateURLParams.query ? `?${new URLSearchParams(generateURLParams.query).toString()}` : "";
    const generatedURL = `${urlString}${endpointString}${queryString}`;
    Debugger.log(this.generateURL.name, `Generated request URL: ${generatedURL}`);
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
  static generateHeaders(generateHeaderParams) {
    const generatedHeaders = {
      ...generateHeaderParams.customHeaders,
      "Content-Type": generateHeaderParams.contentType ?? "application/json",
      ...(generateHeaderParams.accessToken && {
        Authorization: `Bearer ${generateHeaderParams.accessToken}`,
      }),
      ...(generateHeaderParams.responseLang && { "Accept-Language": generateHeaderParams.responseLang }),
    };
    Debugger.log(this.generateHeaders.name, `Generated headers: ${JSON.stringify(generatedHeaders)}`);
    return generatedHeaders;
  }
}

/**
 * EasyRequester class that provides a simplified interface to make HTTP requests.
 * It manages request configuration, queuing, and aborting.
 */
class EasyRequester {
  POSSIBLE_STATUS_CODES = [200, 201, 202, 203, 204, 205, 206];
  clientConfig;
  requestQueuer = new RequestQueuer();
  requestAborter = new RequestAborter();
  /**
   * Initializes the EasyRequester with the provided client configuration.
   *
   * @param {ClientConfig} clientConfig - The configuration to initialize the client.
   */
  constructor(clientConfig) {
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
  setRequestConfig(requestConfig) {
    const newRequestConfig = {
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
  requestConfig;
  clientConfig;
  requestQueuer;
  requestAborter;
  /**
   * Initializes the ConfiguredRequester with request and client configurations, queuer, and aborter.
   *
   * @param {RequestConfig} requestConfig - The configuration for a request.
   * @param {ClientConfig} clientConfig - The configuration for the client.
   * @param {RequestQueuer} requestQueuer - The request queuer instance.
   * @param {RequestAborter} requestAborter - The request aborter instance.
   */
  constructor(requestConfig, clientConfig, requestQueuer, requestAborter) {
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
  async sendRequest(payload) {
    const generatedURL = Generator.generateURL(this.requestConfig.url);
    const generatedHeaders = Generator.generateHeaders({
      contentType: this.requestConfig.header?.contentType,
      responseLang: this.requestConfig.header?.responseLang,
      customHeaders: this.requestConfig.header?.headers,
    });
    const requestFn = async () => {
      try {
        const requestConfig = {
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
            return await response.json();
          }
          Debugger.log(requestFn.name, "Resolved response message as text");
          return await response.text();
        }
        Debugger.log(requestFn.name, "Received a response with an unexpected status code");
        if (this.clientConfig.onNewRequest === "abort-previous") {
          Debugger.log(requestFn.name, "Deleted request aborder controllers.");
          this.requestAborter.getControllers().delete(generatedURL);
        }
        return { isSuccess: false };
      } catch (error) {
        Debugger.error(requestFn.name, `An error ocurred during request ${error}`);
        if (this.clientConfig.onNewRequest === "abort-previous") {
          Debugger.log(requestFn.name, "Deleted request aborder controllers.");
          this.requestAborter.handleAbortError(generatedURL);
        }
        return { isSuccess: false, message: error };
      }
    };
    if (this.clientConfig.onNewRequest === "enqueue-new") {
      Debugger.log(requestFn.name, "Request enqueued");
      return this.requestQueuer.enqueueRequest(requestFn);
    }
    return requestFn();
  }
}

export { EasyRequester };
