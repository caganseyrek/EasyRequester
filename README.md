# EasyRequester

![NPM Version](https://img.shields.io/npm/v/easy-requester)
![NPM Downloads](https://img.shields.io/npm/d18m/easy-requester)
![NPM License](https://img.shields.io/npm/l/easy-requester)

EasyRequester is a custom and flexible HTTP client wrapper.

## Features

- **Customizable Status Code Handling:** Define acceptable status codes for responses.
- **Simple but Extensive Configuration:** Offers simple configuration that can be extended to meet advanced requirements.
- **Promise-based API:** Fully compatible with async/await syntax.
- **TypeScript Support:** Built with TypeScript for strong type safety.
- **Debug Mode:** Enable detailed console logs for easier debugging.

## Installation

```bash
npm i easy-requester
# or
pnpm add easy-requester
```

## How does it work?

- There are four required parameters you need to pass to the requester: **baseURL**, **endpoint**, **method**, and **payload**. In addition to these parameters, there are other optional parameters you can add to customize your request.

  ```typescript
  declare type Methods = "GET" | "HEAD" | "OPTIONS" | "TRACE" | "PUT" | "DELETE" | "POST" | "PATCH" | "CONNECT";
  declare type HttpProtocols = "http" | "https";
  declare interface EasyRequesterConfig {
    protocol?: HttpProtocols;
    baseURL: string;
    port?: number;
    endpoint: object | string;
    method: Methods;
    customHeaders?: Record<string, string>;
    contentType?: string;
    accessToken?: string | number;
    includeCookies?: boolean;
    responseLang?: string;
    possibleStatusCodes?: number[];
    query?: Record<string, string>;
    payload: object | Record<string, string> | string;
  }
  ```

## Required Parameters

- **baseURL**: This is the base URL of your backend server or where you want to send the request. (For example: `https://example.com/api`).
- **endpoint**: This is the endpoint in the server where we send a request. It accepts either a string or an object.
  > You can add the endpoint as a single string like `user/login` or as an object. This object's values forms the endpoint string so names of keys does not matter in this object. For example if you pass an object like `{ route: "user", controller: "login" }` the endpoint would be `user/login`
- **method**: This is the method of the request (duh). It accepts the values shown above.
- **payload**: This is the body part of the request. It is the the data you are sending to the endpoint.

## Optional Parameters

- **protocol**: This parameter defines the protocol used in the request which is either `http` or `https`. It defaults to `https`.
- **port**: This parameter defines the port. For example when you pass `8080` to this parameter, it sends the request to `https://example.com:8080/api/`.
- **headers**: This parameter controls the headers of the request. There are another parameters for authorization and response language, so you don't need to include them either.
- **contentType**: This parameter defines the `Content-Type` of the request. It defaults to `"Content-Type": "application/json"`.
- **accessToken**: This parameters is included in the head as Bearer Token like `Authorization: "Bearer <accessToken>`.
- **includeCookies**: This parameter controls whether currently present cookies should be sent with the request or not. It defaults to `false`.
- **responseLang**: This parameters is for the endpoints which have a localization option and should be set to the language code the response needs to be in.
- **statusCodes**: This is the acceptable status codes. By default any code that starts with 2 (`2xx`) is an acceptable code. You can pass status codes like 400, 401 etc. as a list to prevent the requester from throwing errors. For example, if you include the 401 (Bad Request) status code, the requester does not throw an error so you can process the error message sent by the backend to show a dialog or something like that to the end-user.
  > Default status codes are all `2xx` codes but if you pass any code list to this parameter, the default codes are overwritten. So if you are adding additional status codes, don't forget to add `2xx` status codes also.
- **query**: This is the query appended to the complete request URL. For example if you are sending a request to `https://example.com/api/post/getAllPosts` and included `publishYear=2024`, the final URL looks like this: `https://example.com/api/post/getAllPosts?publishYear=2024`.
-

## Example Usage

First, initialize the requester class, then provide the required and optional parameters via `setConfig()`, and invoke the `sendRequest()` function. Then you can update the requester config simply by calling `setConfig()` function again and passing the new parameters.

The `sendRequest` function requires a return type for the response.

```typescript
import { EasyRequester, EasyRequesterConfig } from "easy-requester";

const requestConfig: EasyRequesterConfig = {
  protocol: "https",
  baseURL: "example.com/api",
  endpoint: "user/login",
  method: "POST",
  payload: requestData,
  query: queryData,
};

async function fetchSomeData(requestData: object | string, queryData: string) {
  try {
    const response = new EasyRequester().setConfig(requestConfig).sendRequest<ResponseType, RequestPayloadType>();

    return response;
  } catch (error) {
    console.error(error);
    throw new Error(error as string);
  }
}
```

## Debug Mode

Debug mode logs almost every action to the console. You can enable the debug mode by calling `debugMode()` and passing a `boolean` value for toggling. You if you call the function and pass a `true`, you can pass false value later in code to disable the debug mode. You can chain this function with other functions.

```typescript
const requester = new EasyRequester().debugMode(true).setConfig({ ...someConfig });
```

## License

This project is open-source and licensed under [MIT License](https://github.com/caganseyrek/EasyRequester/blob/main/LICENSE).
