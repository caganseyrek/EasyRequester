# EasyRequester

A custom and flexible HTTP requester that uses [Axios](https://axios-http.com/).

## Installation

```bash
npm i easy-requester
# or
pnpm add easy-requester
```

## How does it work?

- The requester initializes an Axios instance first and passes the provided props to that Axios instance's config.
- There are four required parameters you need to pass to the requester: **baseURL**, **endpoint**, **method**, and **payload**. In addition to these parameters, there are other optional parameters you can add to customize your request.

  ```typescript
  type Methods =
    | "GET"
    | "HEAD"
    | "OPTIONS"
    | "TRACE"
    | "PUT"
    | "DELETE"
    | "POST"
    | "PATCH"
    | "CONNECT";
  type HttpProtocols = "http" | "https";

  type EndpointProps = {
    route: string;
    controller: string;
  };

  export interface EasyRequesterConfig extends AxiosRequestConfig {
    protocol?: HttpProtocols;
    baseURL: string;
    port?: number;
    endpoint: EndpointProps | string;
    method: Methods;
    headers?: RawAxiosRequestHeaders | AxiosHeaders | Record<string, string>;
    contentType?: string;
    accessToken?: string | number;
    includeCookies?: boolean;
    responseLang?: string;
    statusCodes?: number[];
    query?: Record<string, string>;
    payload: object | Record<string, string> | string;
    additionalOptions?: object;
  }
  ```

## Required Parameters

- **baseURL**: This is the base URL of your backend server or where you want to send the request. It should end with "/". For example: `https://example.com/api/`.
- **endpoint**: This is the endpoint in the server where we send a request. It accepts two types, first one is string (e.g "user/login"), and the second one is `typeof EndpointProps` shown above.
  > `route` and `controller` are suitable names for situations where there are multiple controller files, each containing a single function (as I tend to do). However, if you have a single controller file with multiple functions, you might consider using a string for endpoint.
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
- This config type extends to `AxiosRequestConfig`, so you can add other parameters which ares available in the `AxiosRequestConfig`.

## Example Usage

First, initialize the requester class, then provide the required and optional parameters, and invoke the `sendRequest` function. You can do this in two ways shown below.

The `sendRequest` function requires a return type for the response.

```typescript
import { EasyRequester } from "easy-requester";

async function fetchSomeData(requestData: object | string, queryData: string) {
  try {
    const requestConfig: EasyRequesterConfig = {
      protocol: "https",
      baseURL: "example.com/api",
      endpoint: "user/login"
      method: "POST",
      payload: requestData,
      query: queryData,
    }

    const requester = EasyRequester.setConfig(requestConfig);
    const response = requester.sendRequest<ResponseType, RequestPayloadType>();

    return response;
  } catch (error) {
    console.error(error);
    throw new Error(error as string);
  }
}
```

You can update the request config simply by calling `setConfig()` function and passing the required and optional parameters.

## Debug Mode

Debug mode logs almost every action to the console. You can enable the debug mode by calling `debugMode()` and passing a `boolean` value for toggling. You if you call the function and pass a `true`, you can pass false value later in code to disable the debug mode.

```typescript
const requester = EasyRequester.setConfig({ ...someConfig }).debugMode(true);
// or
const requester = EasyRequester.debugMode(true);
```
