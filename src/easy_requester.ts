import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  AxiosResponse,
  RawAxiosRequestHeaders,
} from "axios";

type Methods =
  | "GET"
  | "HEAD"
  | "OPTIONS"
  | "TRACE"
  | "PUT"
  | "DELETE"
  | "POST"
  | "PATCH"
  | "CONNECT";

type EndpointProps = {
  route: string;
  controller: string;
};

type HttpProtocols = "http" | "https";

export interface EasyRequesterConfig extends AxiosRequestConfig {
  protocol?: HttpProtocols;
  baseURL: string;
  port?: number;
  endpoint: EndpointProps | string;
  method: Methods;
  retries?: number;
  headers?: RawAxiosRequestHeaders | AxiosHeaders;
  contentType?: string;
  accessToken?: string;
  includeCookies?: boolean;
  responseLang?: string;
  statusCodes?: number[];
  query?: Record<string, string>;
  payload: object | Record<string, string> | string;
  additionalOptions?: object;
}

export default class EasyRequester {
  private protocol?: "http" | "https";
  private baseURL: string;
  private port?: number;
  private endpoint: EndpointProps | string;
  private method: Methods;
  private headers?: RawAxiosRequestHeaders | AxiosHeaders;
  private contentType?: string;
  private accessToken?: string;
  private includeCookies?: boolean = false;
  private responseLang?: string;
  private statusCodes?: number[];
  private query?: Record<string, string>;
  private payload: object | Record<string, string> | string;
  private additionalOptions?: object;

  constructor({
    protocol,
    baseURL,
    port,
    endpoint,
    method,
    headers,
    contentType,
    accessToken,
    includeCookies,
    responseLang,
    statusCodes,
    query,
    payload,
    ...additionalOptions
  }: EasyRequesterConfig) {
    this.protocol = protocol ?? "https";
    this.baseURL = baseURL;
    this.port = port;
    this.endpoint = endpoint;
    this.method = method;
    this.contentType = contentType;
    this.accessToken = accessToken;
    this.includeCookies = includeCookies ?? false;
    this.responseLang = responseLang;
    this.statusCodes = statusCodes;
    this.headers = {
      ...headers,
      "Content-Type": contentType ? this.contentType : "application/json",
      ...(accessToken && { Authorization: `Bearer ${this.accessToken}` }),
      ...(responseLang && { "Accept-Language": this.responseLang }),
    };
    this.query = query;
    this.payload = payload;
    this.additionalOptions = additionalOptions;
  }

  async sendRequest<TResponse = AxiosResponse>(): Promise<TResponse> {
    let requestUrl: string;
    if (typeof this.endpoint === "string") {
      requestUrl = `${this.protocol}://${this.baseURL}:${this.port ? this.port : ""}/${
        this.endpoint
      }`;
    } else {
      requestUrl = `${this.protocol}://${this.baseURL}:${this.port ? this.port : ""}/${
        this.endpoint.route
      }/${this.endpoint.controller}`;
    }

    if (this.query) {
      const queryString = new URLSearchParams(this.query).toString();
      requestUrl += `?${queryString}`;
    }

    const possibleStatusCodes = this.statusCodes ?? [
      200, 201, 202, 203, 204, 205, 206, 207, 208, 226,
    ];

    const axiosInstance = axios.create({ baseURL: requestUrl });
    axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        if (error.response && possibleStatusCodes.includes(error.response!.status)) {
          return Promise.resolve(error.response!.data);
        }
        return Promise.reject(error);
      },
    );

    const axiosConfig: AxiosRequestConfig = {
      ...this.additionalOptions,
      url: requestUrl,
      method: this.method,
      headers: this.headers,
      data: this.payload,
      withCredentials: this.includeCookies,
      validateStatus: function (status) {
        return possibleStatusCodes.includes(status);
      },
    };

    const response = await axiosInstance.request<TResponse>(axiosConfig);
    return response.data as TResponse;
  }
}
