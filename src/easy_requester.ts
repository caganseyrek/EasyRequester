import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  AxiosResponse,
  RawAxiosRequestHeaders,
} from "axios";

type Methods = "GET" | "HEAD" | "OPTIONS" | "TRACE" | "PUT" | "DELETE" | "POST" | "PATCH" | "CONNECT";
type HttpProtocols = "http" | "https";

/**
 * Configuration options for the EasyRequester class.
 * @interface EasyRequesterConfig
 * @param {EasyRequesterConfig} config - The configuration object for the request.
 * @description See the usage at https://github.com/caganseyrek/EasyRequester#README
 */
export interface EasyRequesterConfig extends AxiosRequestConfig {
  /**
   * Protocol of the request. Defaults to `https`.
   * @param {HttpProtocols} [protocol="https"] **Optional**
   */
  protocol?: HttpProtocols;

  /**
   * BaseURL of the http request. Should **not** include the endpoint. (e.g. `api.example.com`)
   * @param {string} baseURL **Required**
   */
  baseURL: string;

  /**
   * Port number to use in the base URL. (e.g. `api.example.com:8080`)
   * @param {number} port **Optional**
   */
  port?: number;

  /**
   * The endpoint that comes after the base URL. If you pass an object to endpoint prop, only the values used for generating the endpoint and not the keys.
   * @param {object | string} endpoint **Required**
   * @example
   * config.endpoint = { route: "user", controller: "login" };
   * config.endpoint = "user/login";
   */
  endpoint: object | string;

  /**
   * Method of the http request (e.g., `GET`, `POST`).
   * @param {Methods} method **Required**
   */
  method: Methods;

  /**
   * FHeaders for the request.
   * @param {RawAxiosRequestHeaders | AxiosHeaders | Record<string, string>} headers **Optional**
   */
  headers?: RawAxiosRequestHeaders | AxiosHeaders | Record<string, string>;

  /**
   * Content-Type for the request. Defaults to `application/json`.
   * @param {string} [contentType="application/json"] **Optional**
   */
  contentType?: string;

  /**
   * Access token for authorization, if required by the backend.
   * @param {string | number} accessToken **Optional**
   */
  accessToken?: string | number;

  /**
   * Whether to include cookies in the request. Defaults to `false`.
   * @param {boolean} [includeCookies=false] **Optional**
   */
  includeCookies?: boolean;

  /**
   * Language for the response data (Accept-Language header). Does not have a default value.
   * @param {string?} responseLang **Optional**
   */
  responseLang?: string;

  /**
   * List of acceptable status codes that requester does not throw an error when received. Defaults to status codes like `2xx`.
   * @param {number[]} statusCodes **Optional**
   */
  statusCodes?: number[];

  /**
   * Query parameters to include in the request.
   * @param {Record<string, string>} query **Optional**
   */
  query?: Record<string, string>;

  /**
   * The payload data for the request.
   * @param {object | Record<string, string> | string} payload **Required**
   */
  payload: object | Record<string, string> | string;

  /**
   * Additional Axios options for the request.
   * @param {object?} additionalOptions **Optional**
   */
  additionalOptions?: object;
}

class EasyRequester {
  private isDebugMode?: boolean = true;
  private protocol?: "http" | "https" = "https";
  private baseURL: string = "";
  private port?: number;
  private endpoint: object | string = "";
  private method: Methods;
  private headers?: RawAxiosRequestHeaders | AxiosHeaders | Record<string, string>;
  private generatedHeaders?: object;
  private contentType?: string;
  private accessToken?: string | number;
  private includeCookies?: boolean = false;
  private responseLang?: string;
  private statusCodes: number[] = [];
  private query?: Record<string, string>;
  private payload: object | Record<string, string> | string = {};
  private additionalOptions?: object;

  constructor() {
    this.protocol = "https";
    this.baseURL = "";
    this.endpoint = { route: "", controller: "" };
    this.method = "POST";
    this.contentType = "application/json";
    this.accessToken = "";
    this.includeCookies = false;
    this.responseLang = "";
    this.statusCodes = [];
    this.payload = {};
    this.additionalOptions = {};
    this.headers = {};
    this.generatedHeaders = this.generateHeaders();
  }

  private debugModeLog(message: string, data?: object | string): void {
    if (this.isDebugMode) {
      const formattedData = data ? `: ${JSON.stringify(data)}` : "";
      // eslint-disable-next-line no-console
      console.debug(`[EasyRequester_DEBUG]: ${message}${formattedData}`);
    }
  }

  private generateHeaders(): object {
    this.debugModeLog("Generating headers");
    const headers = {
      ...this.headers,
      "Content-Type": this.contentType ? this.contentType : "application/json",
      ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
      ...(this.responseLang && { "Accept-Language": this.responseLang }),
    };
    this.debugModeLog("Generated headers", headers);
    return headers;
  }

  private generateEndpointFromObject(): string {
    let generatedEndpoint: string = "";

    if (typeof this.endpoint === "object") {
      Object.entries(this.endpoint).forEach(([key, value]) => {
        if (typeof value !== "string") {
          throw new Error(`[EasyRequester_ERROR] Value for key "${key}" must be a string`);
        }
        const sanitizedValue = value.replace(/^\/|\/$/g, "");
        if (sanitizedValue.includes("/")) {
          throw new Error(`[EasyRequester_ERROR] Value for key "${key}" contains an invalid slash`);
        }
        generatedEndpoint += `/${sanitizedValue}`;
      });
      return generatedEndpoint;
    }
    return this.endpoint.replace(/^\/|\/$/g, "");
  }

  private generateURL(): string {
    this.debugModeLog("Generating request URL");

    const urlString: string = `${this.protocol}://${this.baseURL}${this.port ? `:${this.port}` : ""}`;
    const endpointString: string = this.generateEndpointFromObject();
    const queryString: string = this.query ? new URLSearchParams(this.query).toString() : "";

    const generatedURL: string = `${urlString}${endpointString}?${queryString}`;
    this.debugModeLog("Generated request URL", generatedURL);
    return generatedURL;
  }

  private validateConfig() {
    if (this.protocol && this.protocol !== "https" && this.protocol !== "http") {
      throw new Error("[EasyRequester_ERROR] Protocol should be 'http' or 'https'.");
    }
    if (!this.baseURL) {
      throw new Error("[EasyRequester_ERROR] BaseURL is required for requester.");
    }
    if (this.port && typeof this.port !== "number") {
      throw new Error("[EasyRequester_ERROR] Port should be typeof 'number'.");
    }
    if (typeof this.endpoint !== "string" && typeof this.endpoint !== "object") {
      throw new Error("[EasyRequester_ERROR] Endpoint should be typeof 'string' or typeof 'EndpointProps'.");
    }
    if (this.contentType && typeof this.contentType !== "string") {
      throw new Error("[EasyRequester_ERROR] contentType should be typeof 'string'.");
    }
    if (this.responseLang && typeof this.responseLang !== "string") {
      throw new Error("[EasyRequester_ERROR] responseLang should be typeof 'string'.");
    }
    if (this.accessToken && typeof this.accessToken !== "string" && typeof this.accessToken !== "number") {
      throw new Error("[EasyRequester_ERROR] Endpoint should be typeof 'string' or typeof 'number'.");
    }
  }

  /**
   * Sets up the configuration for the EasyRequester instance.
   * @param {EasyRequesterConfig} config
   * @returns The EasyRequester instance for chaining.
   * @throws {Error} If required configuration fields are missing or invalid.
   * @example
   * EasyRequester.setConfig({ ...config });
   */
  public setConfig(config: EasyRequesterConfig): EasyRequester {
    this.protocol = config.protocol ?? this.protocol;
    this.baseURL = config.baseURL.replace(/\/$/, "");
    this.port = config.port ?? this.port;
    this.endpoint = config.endpoint;
    this.method = config.method;
    this.contentType = config.contentType ?? this.contentType;
    this.accessToken = config.accessToken ?? this.accessToken;
    this.includeCookies = config.includeCookies ?? this.includeCookies;
    this.responseLang = config.responseLang ?? this.responseLang;
    this.statusCodes = config.statusCodes ?? [];
    this.query = config.query ?? this.query;
    this.payload = config.payload ?? {};
    this.additionalOptions = config.additionalOptions ?? {};
    this.headers = config.headers ?? {};
    this.generatedHeaders = this.generateHeaders();

    this.validateConfig();
    return this;
  }

  /**
   * Toggles debug mode for logging request and requester instance details.
   * @param {boolean} [isToggled=false] **Optional**
   * @description If true, enables debug logging. Defaults to `false`.
   * @returns {EasyRequester} The EasyRequester instance for chaining.
   * @example
   * EasyRequester.debugMode(true);
   */
  public debugMode(isToggled: boolean = false): EasyRequester {
    this.isDebugMode = isToggled;
    return this;
  }

  /**
   * Sends an HTTP request using the configured settings.
   * @template TResponse - Type of the expected response data.
   * @template TPayload - Type of the payload data.
   * @requires `setConfig()` to set the request configuration.
   * @returns {Promise<AxiosResponse<TResponse, TPayload>>} A promise resolving with the Axios response.
   * @throws {AxiosError} For HTTP requests that does not match the possible status codes.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async sendRequest<TResponse = any, TPayload = any>(): Promise<AxiosResponse<TResponse, TPayload>> {
    const axiosInstance = axios.create({ baseURL: this.generateURL() });
    axiosInstance.interceptors.response.use(
      (response: AxiosResponse<TResponse, TPayload>) => {
        this.debugModeLog("Received a response", response);
        if (this.statusCodes && this.statusCodes.includes(response.status)) {
          return Promise.resolve(response);
        }
        return response;
      },
      (error: AxiosError) => {
        if (error.response && this.statusCodes && this.statusCodes.includes(error.response!.status)) {
          this.debugModeLog("Intercepted an error with a possible code", error.response);
          return Promise.resolve(error.response as AxiosResponse<TResponse, TPayload>);
        }
        this.debugModeLog("Received an error", error.response);
        return Promise.reject(error);
      },
    );

    const possibleStatusCodes = this.statusCodes;
    const axiosConfig: AxiosRequestConfig<TPayload> = {
      ...this.additionalOptions,
      baseURL: this.generateURL(),
      method: this.method,
      headers: this.generatedHeaders,
      data: this.payload as TPayload,
      withCredentials: this.includeCookies,
      validateStatus: (status) => {
        return this.statusCodes ? possibleStatusCodes.includes(status) : status >= 200 && status < 300;
      },
    };

    const response = await axiosInstance.request<TResponse, AxiosResponse<TResponse, TPayload>>(axiosConfig);
    return response;
  }
}

/**
 * @description EasyRequester is a customizable HTTP requester and request handler with detailed configuration. See https://github.com/caganseyrek/EasyRequester for more info and details about how to use.
 */
export default new EasyRequester();
