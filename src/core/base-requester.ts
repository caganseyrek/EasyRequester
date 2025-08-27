import { ConfiguredRequester } from "@/core/configured-requester";

import type { EasyRequesterConfig, PerRequestConfig } from "@/globals";

class BaseRequester {
  private easyRequesterConfig: EasyRequesterConfig;

  constructor(easyRequesterConfig: EasyRequesterConfig) {
    this.easyRequesterConfig = {
      baseUrl: easyRequesterConfig.baseUrl,
      onNewRequest: easyRequesterConfig.onNewRequest ?? "enqueue-new",
    };
  }

  public setRequestConfig(perRequestConfig: PerRequestConfig): ConfiguredRequester {
    return new ConfiguredRequester(this.easyRequesterConfig, perRequestConfig);
  }
}

export { BaseRequester };
