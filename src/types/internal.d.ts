/* eslint-disable @typescript-eslint/no-unused-vars */
import type { HttpProtocols, Methods } from "../types";

namespace RequesterConfigParams {
  interface RequestURLParams {
    protocol: HttpProtocols;
    baseURL: string;
    port?: number;
    endpoint: object | string;
    query?: Record<string, string>;
  }
  interface RequestHeaderParams {
    method: Methods;
    contentType: string;
    responseLang?: string;
    customHeaders?: Record<string, string>;
    generatedHeaders?: object;
  }
  interface RequestAuthParams {
    accessToken?: string | number;
    includeCookies?: boolean;
  }
  type RequestPayloadType = object | Record<string, string> | string;
  type ResponseDetailsParams = { possibleStatusCodes: number[] };
}

namespace InternalTypes {
  interface RequesterParams {
    requestURLParams: RequesterConfigParams.RequestURLParams;
    requestHeaderParams: RequesterConfigParams.RequestHeaderParams;
    requestAuthParams: RequesterConfigParams.RequestAuthParams;
    requestPayload: RequesterConfigParams.RequestPayloadType;
    responseDetailsParams: RequesterConfigParams.ResponseDetailsParams;
  }
  namespace Utils {
    type ValidatorParams = Omit<RequesterConfigParams.RequestURLParams, "query"> &
      Pick<RequesterConfigParams.RequestHeaderParams, "contentType"> &
      Pick<RequesterConfigParams.RequestHeaderParams, "responseLang"> &
      RequesterConfigParams.RequestAuthParams;
    namespace Generators {
      type GenerateHeaderParams = Omit<Omit<RequesterConfigParams.RequestHeaderParams, "method">, "generatedHeaders"> &
        Pick<RequesterConfigParams.RequestAuthParams, "accessToken">;
      type GenerateEndpointFromObjectParams = Pick<RequesterConfigParams.RequestURLParams, "endpoint">;
      type GenerateURLParams = RequesterConfigParams.RequestURLParams;
    }
  }
}

export default InternalTypes;
