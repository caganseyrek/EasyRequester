import { HttpProtocols } from "../types";
import { AxiosHeaders, RawAxiosRequestHeaders } from "axios";

namespace InternalTypes {
  export interface ValidatorParams {
    protocol?: HttpProtocols;
    baseURL: string;
    port?: number;
    endpoint: object | string;
    contentType?: string;
    accessToken?: string | number;
    responseLang?: string;
  }
  export namespace GeneratorTypes {
    export interface GenerateHeaderParams {
      headers?: RawAxiosRequestHeaders | AxiosHeaders | Record<string, string>;
      contentType?: string;
      accessToken?: string | number;
      responseLang?: string;
    }
    export interface GenerateEndpointFromObject {
      endpoint: object | string;
    }
    export interface GenerateURLParams {
      protocol?: HttpProtocols;
      baseURL: string;
      port?: number;
      endpoint: object | string;
      query?: Record<string, string>;
    }
  }
}

export default InternalTypes;
