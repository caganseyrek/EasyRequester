import type InternalTypes from "../types/internal";

import Debugger from "./debugger";

class Generators {
  public static generateHeaders(GenerateHeaderParams: InternalTypes.Utils.Generators.GenerateHeaderParams): object {
    Debugger.log("Generating headers...");
    const generatedHeaders = {
      ...GenerateHeaderParams.customHeaders,
      "Content-Type": GenerateHeaderParams.contentType,
      ...(GenerateHeaderParams.accessToken && {
        Authorization: `Bearer ${GenerateHeaderParams.accessToken}`,
      }),
      ...(GenerateHeaderParams.responseLang && { "Accept-Language": GenerateHeaderParams.responseLang }),
    };
    Debugger.log(`Generating headers: ${JSON.stringify(generatedHeaders)}`);
    return generatedHeaders;
  }

  public static generateEndpointFromObject(
    generateEndpointFromObjectParams: InternalTypes.Utils.Generators.GenerateEndpointFromObjectParams,
  ): string {
    let generatedEndpoint: string = "";

    Debugger.log("Generating endpoint...");
    if (typeof generateEndpointFromObjectParams.endpoint === "object") {
      Object.entries(generateEndpointFromObjectParams.endpoint).forEach(([key, value]) => {
        if (typeof value !== "string") {
          Debugger.error(`Expected value for key "${key}" to be typeof 'string'.`);
        }
        const sanitizedValue = value.replace(/^\/|\/$/g, "");
        if (sanitizedValue.includes("/")) {
          Debugger.error(`Value for key "${key}" contains an invalid slash`);
        }
        generatedEndpoint += `/${sanitizedValue}`;
      });
      Debugger.log(`Generating endpoint from object: ${JSON.stringify(generatedEndpoint)}`);
      return generatedEndpoint;
    }
    generatedEndpoint = "/" + generateEndpointFromObjectParams.endpoint.replace(/^\/|\/$/g, "");
    Debugger.log(`Generating endpoint from string: ${JSON.stringify(generatedEndpoint)}`);
    return generatedEndpoint;
  }

  public static generateURL(generateURLParams: InternalTypes.Utils.Generators.GenerateURLParams): string {
    Debugger.log("Generating request URL...");
    const urlString: string = `${generateURLParams.protocol}://${generateURLParams.baseURL}${
      generateURLParams.port ? `:${generateURLParams.port}` : ""
    }`;
    const endpointString: string = this.generateEndpointFromObject({ endpoint: generateURLParams.endpoint });
    const queryString: string = generateURLParams.query
      ? `?${new URLSearchParams(generateURLParams.query).toString()}`
      : "";

    const generatedURL: string = `${urlString}${endpointString}${queryString}`;
    Debugger.log(`Generated request URL: ${generatedURL}`);
    return generatedURL;
  }
}

export default Generators;
