export type Methods = "GET" | "HEAD" | "OPTIONS" | "TRACE" | "PUT" | "DELETE" | "POST" | "PATCH" | "CONNECT";

export type HttpProtocols = "http" | "https";

export type RaceConditionHandlerParams = "abort-previous" | "enqueue-new";

export type PayloadType = object | Record<string, string> | string;

export interface BaseResponse {
  isSuccess: boolean;
  message?: string;
}

export interface ClientConfig {
  onNewRequest?: RaceConditionHandlerParams;
  acceptStatusCodes?: number[];
  isDebugMode?: boolean;
}

export interface RequestConfig {
  url: {
    protocol?: HttpProtocols;
    baseURL: string;
    port?: number;
    endpoint: object | string;
    query?: Record<string, string>;
  };
  method: Methods;
  header?: {
    contentType?: string;
    responseLang?: string;
    headers?: Record<string, string>;
  };
  auth?: {
    accessToken?: string | number;
    includeCookies?: boolean;
  };
}

export namespace ConfigSection {
  export interface ClientParams {
    setDebugMode: boolean;
    onNewRequest?: RaceConditionHandlerParams;
    acceptStatusCodes?: number[];
  }
  export interface URLParams {
    protocol?: HttpProtocols;
    baseURL: string;
    port?: number;
    endpoint: object | string;
    query?: Record<string, string>;
  }
  export interface HeaderParams {
    contentType?: string;
    responseLang?: string;
    customHeaders?: Record<string, string>;
  }
  export interface AuthParams {
    accessToken?: string | number;
    includeCookies?: boolean;
  }
}

// Internal
type AnyExceptUndefined = Exclude<any, undefined | null>;

export interface RequestQueueProps {
  requestFn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (reason: AnyExceptUndefined) => void;
}

type GenerateEndpointParams = Pick<ConfigSection.URLParams, "endpoint">;
type GenerateURLParams = ConfigSection.URLParams;
type GenerateHeaderParams = ConfigSection.HeaderParams & Pick<ConfigSection.AuthParams, "accessToken">;
