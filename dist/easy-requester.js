class RequestAborter {
    controllers;
    abortController;
    constructor() {
        this.controllers = new Map();
    }
    getControllers() {
        return this.controllers;
    }
    setupAbortController(generatedURL, requestConfig) {
        this.abortController = new AbortController();
        requestConfig.signal = this.abortController.signal;
        if (this.controllers.has(generatedURL)) {
            const previousController = this.controllers.get(generatedURL);
            previousController?.abort();
        }
        this.controllers.set(generatedURL, this.abortController);
    }
    handleAbortError(generatedURL) {
        this.getControllers().delete(generatedURL);
    }
}
class RequestQueuer {
    requestQueue = [];
    isRequestInProgress = false;
    async processQueue() {
        if (this.isRequestInProgress || this.requestQueue.length === 0) {
            return;
        }
        const { requestFn, resolve, reject } = this.requestQueue.shift();
        this.isRequestInProgress = true;
        try {
            const response = await requestFn();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
        finally {
            this.isRequestInProgress = false;
            this.processQueue();
        }
    }
    enqueueRequest(requestFn) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ requestFn, resolve, reject });
            this.processQueue();
        });
    }
}
class ConcurrencyManager {
    requestAborterInstance;
    requestQueuerInstance;
    constructor() {
        this.requestAborterInstance = new RequestAborter();
        this.requestQueuerInstance = new RequestQueuer();
    }
    get requestAborter() {
        return this.requestAborterInstance;
    }
    get requestQueuer() {
        return this.requestQueuerInstance;
    }
}

class ConfiguredRequester {
    concurrencyManager;
    easyRequesterConfig;
    perRequestConfig;
    constructor(easyRequesterConfig, perRequestConfig) {
        this.concurrencyManager = new ConcurrencyManager();
        this.easyRequesterConfig = easyRequesterConfig;
        this.perRequestConfig = perRequestConfig;
    }
    generateHeadersForRequest() {
        return this.perRequestConfig.headers
            ? {
                ...(this.perRequestConfig.headers.customHeaders ? this.perRequestConfig.headers.customHeaders : {}),
                "Content-Type": this.perRequestConfig.headers.contentType ?? "application/json",
                ...(this.perRequestConfig.headers.responseLang && {
                    "Accept-Language": this.perRequestConfig.headers.responseLang,
                }),
                ...(this.perRequestConfig.auth?.accessToken && {
                    Authorization: `Bearer ${this.perRequestConfig.auth?.accessToken}`,
                }),
            }
            : {};
    }
    generateRequestUrl() {
        const baseUrl = this.perRequestConfig.overrideBaseUrl
            ? this.perRequestConfig.overrideBaseUrl
            : this.easyRequesterConfig.baseUrl;
        return `${baseUrl.replace(/\/+$/, "")}/${this.perRequestConfig.endpoint.replace(/^\/+/, "")}`;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async sendRequest(payload) {
        const generatedUrl = this.generateRequestUrl();
        const generatedHeaders = this.generateHeadersForRequest();
        const requestFn = async () => {
            try {
                const requestConfig = {
                    method: this.perRequestConfig.method,
                    headers: generatedHeaders,
                    credentials: this.perRequestConfig.auth && this.perRequestConfig.auth.includeCookies ? "include" : "same-origin",
                };
                if (this.easyRequesterConfig.onNewRequest === "abort-previous") {
                    this.concurrencyManager.requestAborter.setupAbortController(generatedUrl, requestConfig);
                }
                /**
                 * Skip adding request body if request method is either 'GET' or 'HEAD'.
                 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET
                 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD
                 */
                if (!["GET", "HEAD"].includes(this.perRequestConfig.method)) {
                    requestConfig.body = JSON.stringify(payload);
                }
                const response = await fetch(generatedUrl, requestConfig);
                if (!response.ok) {
                    if (this.easyRequesterConfig.onNewRequest === "abort-previous") {
                        this.concurrencyManager.requestAborter.getControllers().delete(generatedUrl);
                    }
                    throw new Error(response.statusText);
                }
                const formattedResponse = {
                    success: true,
                    message: response.statusText,
                    data: response.headers.get("content-type")?.includes("application/json")
                        ? await response.json()
                        : await response.text(),
                };
                return formattedResponse;
            }
            catch (error) {
                if (this.easyRequesterConfig.onNewRequest === "abort-previous") {
                    this.concurrencyManager.requestAborter.handleAbortError(generatedUrl);
                }
                const formattedResponse = {
                    success: false,
                    message: error instanceof Error ? error.name : "An unknown error occurred during request.",
                    data: null,
                };
                return formattedResponse;
            }
        };
        if (this.easyRequesterConfig.onNewRequest === "enqueue-new") {
            return this.concurrencyManager.requestQueuer.enqueueRequest(requestFn);
        }
        return await requestFn();
    }
}

class BaseRequester {
    easyRequesterConfig;
    constructor(easyRequesterConfig) {
        this.easyRequesterConfig = {
            baseUrl: easyRequesterConfig.baseUrl,
            onNewRequest: easyRequesterConfig.onNewRequest ?? "enqueue-new",
        };
    }
    setRequestConfig(perRequestConfig) {
        return new ConfiguredRequester(this.easyRequesterConfig, perRequestConfig);
    }
}

export { BaseRequester as EasyRequester };
