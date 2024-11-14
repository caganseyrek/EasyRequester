/**
 * HTTP methods supported by EasyRequester.
 */
declare type Methods = "GET" | "HEAD" | "OPTIONS" | "TRACE" | "PUT" | "DELETE" | "POST" | "PATCH" | "CONNECT";

/**
 * HTTP protocols supported by EasyRequester.
 */
declare type HttpProtocols = "http" | "https";

/**
 * Configuration options for the EasyRequester class.
 * @interface EasyRequesterConfig
 * @param {EasyRequesterConfig} config - The configuration object for the request.
 * @description See the usage at https://github.com/caganseyrek/EasyRequester#README
 */
declare interface EasyRequesterConfig extends AxiosRequestConfig {
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

export type { Methods, HttpProtocols, EasyRequesterConfig };
