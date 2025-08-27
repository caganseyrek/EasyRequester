type Methods = "GET" | "HEAD" | "OPTIONS" | "TRACE" | "PUT" | "DELETE" | "POST" | "PATCH" | "CONNECT";

type RaceConditionHandlerParams = "abort-previous" | "enqueue-new";

type PayloadType = object | Record<string, string> | string;

interface EasyRequesterConfig {
  baseUrl: string;
  onNewRequest?: RaceConditionHandlerParams;
}

interface PerRequestConfig {
  endpoint: string;
  method: Methods;
  headers?: {
    contentType?: string;
    responseLang?: string;
    customHeaders?: Record<string, string>;
  };
  auth?: {
    accessToken?: string | number;
    includeCookies?: boolean;
  };
  overrideBaseUrl?: string;
}

export type { Methods, RaceConditionHandlerParams, PayloadType, EasyRequesterConfig, PerRequestConfig };
