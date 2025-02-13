import { ConfigSection } from "./globals";

type AnyExceptUndefined = Exclude<any, undefined | null>;

export interface RequestQueueProps {
  requestFn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (reason: AnyExceptUndefined) => void;
}

type GenerateEndpointParams = Pick<ConfigSection.URLParams, "endpoint">;
type GenerateURLParams = ConfigSection.URLParams;
type GenerateHeaderParams = ConfigSection.HeaderParams & Pick<ConfigSection.AuthParams, "accessToken">;
