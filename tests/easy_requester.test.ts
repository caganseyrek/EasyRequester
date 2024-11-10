import { afterEach, describe, expect, it, jest } from "@jest/globals";
import axios from "axios";

import { EasyRequester, EasyRequesterConfig } from "../src/index";

jest.mock("axios");
const axiosMock = axios as jest.Mocked<typeof axios>;

describe("A custom and flexible HTTP requester", () => {
  const baseURL = "example.com/api";
  const endpoint = {
    route: "route",
    controller: "controller",
  };
  const method = "POST";
  const headers: Record<string, string> = {
    "X-Test-Header-1": "Foo",
    "X-Test-Header-2": "Bar",
  };
  const accessToken = "Hey! I am a token!";
  const responseLang = "en";
  const query = { foo: "bar" };
  const payload = { data_1: "foo", data_2: "bar" };

  const easyRequesterConfig: EasyRequesterConfig = {
    baseURL: baseURL,
    endpoint: endpoint,
    method: method,
    headers: headers,
    accessToken: accessToken,
    responseLang: responseLang,
    query: query,
    payload: payload,
  };

  afterEach(() => {
    EasyRequester.debugMode(true);
    jest.clearAllMocks();
  });

  it("should create a complete request url", async () => {
    const requester = EasyRequester.setConfig(easyRequesterConfig);

    axiosMock.create.mockReturnThis();
    axiosMock.request.mockResolvedValueOnce({});

    await requester.sendRequest();

    const expectedUrl = `https://${baseURL}/${endpoint.route}/${
      endpoint.controller
    }?${new URLSearchParams(query).toString()}`;

    expect(axiosMock.request).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: expectedUrl,
      }),
    );
  });

  it("should have default Content-Type in the headers", async () => {
    const requester = EasyRequester.setConfig(easyRequesterConfig);

    axiosMock.create.mockReturnThis();
    axiosMock.request.mockResolvedValueOnce({});

    await requester.sendRequest();

    expect(axiosMock.request).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
  });

  it("should set authorization headers using access token", async () => {
    const requester = EasyRequester.setConfig(easyRequesterConfig);

    axiosMock.create.mockReturnThis();
    axiosMock.request.mockResolvedValueOnce({});

    await requester.sendRequest();

    expect(axiosMock.request).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${accessToken}` }),
      }),
    );
  });

  it("should set language headers using 'responseLang'", async () => {
    const requester = EasyRequester.setConfig(easyRequesterConfig);

    axiosMock.create.mockReturnThis();
    axiosMock.request.mockResolvedValueOnce({});

    await requester.sendRequest();

    expect(axiosMock.request).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({ "Accept-Language": responseLang }),
      }),
    );
  });

  it("should contain custom headers provided", async () => {
    const requester = EasyRequester.setConfig(easyRequesterConfig);

    axiosMock.create.mockReturnThis();
    axiosMock.request.mockResolvedValueOnce({});

    await requester.sendRequest();

    expect(axiosMock.request).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining(headers),
      }),
    );
  });

  /* FIXME
  it("should handle a successful response", async () => {
    const requester = EasyRequester.setConfig(easyRequesterConfig);
    const mockResponse = { response: "It works!" };

    axiosMock.create.mockReturnThis();
    axiosMock.request.mockResolvedValueOnce({ data: mockResponse });

    const response = await requester.sendRequest();

    expect(response).toEqual(mockResponse);
  });
  */

  /* FIXME
  it("should not throw error if response status code is within 2xx range", async () => {
    const requester = EasyRequester.setConfig(easyRequesterConfig);
    const mockResponse = { response: "It still should work!" };

    axiosMock.create.mockReturnThis();
    axiosMock.request.mockResolvedValueOnce({ status: 200, data: mockResponse });

    const response = await requester.sendRequest();

    expect(response).toEqual(mockResponse);
  });
  */
});
