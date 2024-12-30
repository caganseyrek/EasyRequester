import InternalTypes from "../types/internal";
import Debugger from "./debugger";

class Generators {
  public static generateHeaders(GenerateHeaderParams: InternalTypes.GeneratorTypes.GenerateHeaderParams): object {
    return {
      ...GenerateHeaderParams.headers,
      "Content-Type": GenerateHeaderParams.contentType,
      ...(GenerateHeaderParams.accessToken && {
        Authorization: `Bearer ${GenerateHeaderParams.accessToken}`,
      }),
      ...(GenerateHeaderParams.responseLang && { "Accept-Language": GenerateHeaderParams.responseLang }),
    };
  }

  public static generateEndpointFromObject(
    generateEndpointFromObjectParams: InternalTypes.GeneratorTypes.GenerateEndpointFromObject,
  ): string {
    let generatedEndpoint: string = "";

    if (typeof generateEndpointFromObjectParams.endpoint === "object") {
      Object.entries(generateEndpointFromObjectParams.endpoint).forEach(([key, value]) => {
        if (typeof value !== "string") {
          throw new Error(`[EasyRequester_ERROR] Value for key "${key}" must be a string`);
        }
        const sanitizedValue = value.replace(/^\/|\/$/g, "");
        if (sanitizedValue.includes("/")) {
          throw new Error(`[EasyRequester_ERROR] Value for key "${key}" contains an invalid slash`);
        }
        generatedEndpoint += `/${sanitizedValue}`;
      });
      return generatedEndpoint;
    }
    return generateEndpointFromObjectParams.endpoint.replace(/^\/|\/$/g, "");
  }

  public static generateURL(generateURLParams: InternalTypes.GeneratorTypes.GenerateURLParams): string {
    Debugger.log("Generating request URL");

    const urlString: string = `${generateURLParams.protocol}://${generateURLParams.baseURL}${
      generateURLParams.port ? `:${generateURLParams.port}` : ""
    }`;
    const endpointString: string = this.generateEndpointFromObject({ endpoint: generateURLParams.endpoint });
    const queryString: string = generateURLParams.query
      ? `?${new URLSearchParams(generateURLParams.query).toString()}`
      : "";

    const generatedURL: string = `${urlString}${endpointString}${queryString}`;
    Debugger.log("Generated request URL", generatedURL);
    return generatedURL;
  }
}

export default Generators;
