import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  RawAxiosRequestHeaders,
} from "axios";

import { EasyRequesterConfig } from ".";
import { HttpProtocols, Methods } from "./types";
import Generators from "./utils/generators";
import Validator from "./utils/validator";
import Debugger from "./utils/debugger";

const POSSIBLE_STATUS_CODES = [200, 201, 400, 401, 403, 404, 409, 500];

class EasyRequester {
  private protocol: HttpProtocols = "https";
  private baseURL: string = "";
  private port?: number;
  private endpoint: object | string = "";
  private method: Methods = "POST";
  private headers?: RawAxiosRequestHeaders | AxiosHeaders | Record<string, string>;
  private contentType: string = "application/json";
  private accessToken?: string | number;
  private includeCookies?: boolean = false;
  private responseLang?: string;
  private statusCodes: number[] = POSSIBLE_STATUS_CODES;
  private query?: Record<string, string>;
  private payload: object | Record<string, string> | string = {};
  private additionalOptions?: object;
  private generatedHeaders?: object;

  private isDebugMode: boolean = true;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create();
    Debugger.log(`New Axios Instance created: ${this.axiosInstance}`);
  }

  /**
   * Sets up AxiosInstance's interceptors
   */
  private setupInterceptors<TResponse, TPayload>(): void {
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse<TResponse, TPayload>) => {
        Debugger.log("Received a response", response);
        if (this.statusCodes && this.statusCodes.includes(response.status)) {
          return Promise.resolve(response);
        }
        return response;
      },
      (error: AxiosError) => {
        if (error.response && this.statusCodes && this.statusCodes.includes(error.response!.status)) {
          Debugger.log("Intercepted an error with a possible code", error.response);
          return Promise.resolve(error.response as AxiosResponse<TResponse, TPayload>);
        }
        Debugger.log("Received an error", error.response);
        return Promise.reject(error);
      },
    );
  }

  /**
   * Sets up the configuration for the EasyRequester instance.
   * @param {EasyRequesterConfig} config
   * @returns The EasyRequester instance for chaining.
   * @throws {Error} If required configuration fields are missing or invalid.
   * @example
   * new EasyRequester.setConfig({ ...config });
   */
  public setConfig(config: EasyRequesterConfig): EasyRequester {
    this.protocol = config.protocol ?? this.protocol;
    this.baseURL = config.baseURL.replace(/\/$/, "");
    this.port = config.port;
    this.endpoint = config.endpoint;
    this.method = config.method;
    this.contentType = config.contentType ?? this.contentType;
    this.accessToken = config.accessToken;
    this.includeCookies = config.includeCookies;
    this.responseLang = config.responseLang;
    this.statusCodes = config.statusCodes ? this.statusCodes.concat(config.statusCodes!) : this.statusCodes;
    this.query = config.query;
    this.payload = config.payload;
    this.headers = config.headers ?? {};
    this.additionalOptions = config.additionalOptions ?? {};
    this.generatedHeaders = Generators.generateHeaders({
      headers: this.headers,
      contentType: this.contentType,
      accessToken: this.accessToken,
      responseLang: this.responseLang,
    });

    Debugger.setDebugMode(this.isDebugMode);

    Validator.validateConfig({
      protocol: this.protocol,
      baseURL: this.baseURL,
      port: this.port,
      endpoint: this.endpoint,
      contentType: this.contentType,
      accessToken: this.accessToken,
      responseLang: this.responseLang,
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
  public async sendRequest<TResponse = any, TPayload = any>(): Promise<TResponse> {
    this.setupInterceptors<TResponse, TPayload>();
    try {
      const possibleStatusCodes = this.statusCodes;
      const generatedURL: string = Generators.generateURL({
        protocol: this.protocol,
        baseURL: this.baseURL,
        port: this.port,
        endpoint: this.endpoint,
        query: this.query,
      });
      const axiosConfig: AxiosRequestConfig<TPayload> = {
        ...this.additionalOptions,
        baseURL: generatedURL,
        url: generatedURL,
        method: this.method,
        headers: this.generatedHeaders,
        data: this.payload as TPayload,
        withCredentials: this.includeCookies,
        validateStatus: (status) => {
          return this.statusCodes ? possibleStatusCodes.includes(status) : status >= 200 && status < 300;
        },
      };
      const response = await this.axiosInstance.request<TResponse, AxiosResponse<TResponse, TPayload>>(axiosConfig);
      return response.data as TResponse;
    } catch (error) {
      Debugger.log(JSON.stringify(error));
      return null as TResponse;
    }
  }
}

/**
 * @description EasyRequester is a customizable HTTP requester and request handler with detailed configuration. See https://github.com/caganseyrek/EasyRequester for more info and details about how to use.
 */
export default EasyRequester;
