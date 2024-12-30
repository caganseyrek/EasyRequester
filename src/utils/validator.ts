import type InternalTypes from "../types/internal";

import Debugger from "./debugger";

class Validator {
  public static validateConfig(config: InternalTypes.Utils.ValidatorParams) {
    Debugger.log("Validating requester config");
    if (config.protocol && config.protocol !== "https" && config.protocol !== "http") {
      Debugger.error(`Expected protocol parameter to be 'http' or 'https' but found ${config.protocol}`);
    }
    if (!config.baseURL) {
      Debugger.error("BaseURL is a required parameter for requester config.");
    }
    if (config.port && typeof config.port !== "number") {
      Debugger.error(`Expected port parameter to be typeof 'number' but found ${typeof config.port}.`);
    }
    if (typeof config.endpoint !== "string" && typeof config.endpoint !== "object") {
      Debugger.error(
        `Expected endpoint parameter to be typeof 'string' or typeof 'object' but found ${typeof config.endpoint}`,
      );
    }
    if (config.contentType && typeof config.contentType !== "string") {
      Debugger.error(`Expected contentType to be typeof 'string' but found ${config.contentType}.`);
    }
    if (config.responseLang && typeof config.responseLang !== "string") {
      Debugger.error(`Expected responseLang parameter to be typeof 'string' but found ${config.responseLang}.`);
    }
    if (config.accessToken && typeof config.accessToken !== "string" && typeof config.accessToken !== "number") {
      Debugger.error(
        `Expected AccessToken parameter to be typeof 'string' or typeof 'number' but found ${typeof config.accessToken}.`,
      );
    }
  }
}

export default Validator;
