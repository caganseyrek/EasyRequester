import InternalTypes from "../types/internal";

class Validator {
  public static validateConfig(config: InternalTypes.ValidatorParams) {
    if (config.protocol && config.protocol !== "https" && config.protocol !== "http") {
      throw new Error("[EasyRequester_ERROR] config.protocol should be 'http' or 'https'.");
    }
    if (!config.baseURL) {
      throw new Error("[EasyRequester_ERROR] BaseURL is required for requester.");
    }
    if (config.port && typeof config.port !== "number") {
      throw new Error("[EasyRequester_ERROR] Port should be typeof 'number'.");
    }
    if (typeof config.endpoint !== "string" && typeof config.endpoint !== "object") {
      throw new Error("[EasyRequester_ERROR] Endpoint should be typeof 'string' or typeof 'EndpointProps'.");
    }
    if (config.contentType && typeof config.contentType !== "string") {
      throw new Error("[EasyRequester_ERROR] contentType should be typeof 'string'.");
    }
    if (config.responseLang && typeof config.responseLang !== "string") {
      throw new Error("[EasyRequester_ERROR] responseLang should be typeof 'string'.");
    }
    if (
      config.accessToken &&
      typeof config.accessToken !== "string" &&
      typeof config.accessToken !== "number"
    ) {
      throw new Error("[EasyRequester_ERROR] Endpoint should be typeof 'string' or typeof 'number'.");
    }
  }
}

export default Validator;
