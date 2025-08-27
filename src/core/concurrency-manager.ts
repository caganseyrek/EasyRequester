export interface RequestQueueProps {
  requestFn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

class RequestAborter {
  private controllers: Map<string, AbortController>;
  private abortController?: AbortController;

  constructor() {
    this.controllers = new Map();
  }

  public getControllers(): Map<string, AbortController> {
    return this.controllers;
  }

  public setupAbortController(generatedURL: string, requestConfig: RequestInit): void {
    this.abortController = new AbortController();
    requestConfig.signal = this.abortController.signal;

    if (this.controllers.has(generatedURL)) {
      const previousController = this.controllers.get(generatedURL);
      previousController?.abort();
    }
    this.controllers.set(generatedURL, this.abortController);
  }

  public handleAbortError(generatedURL: string): void {
    this.getControllers().delete(generatedURL);
  }
}

class RequestQueuer {
  private requestQueue: RequestQueueProps[] = [];
  private isRequestInProgress: boolean = false;

  private async processQueue(): Promise<void> {
    if (this.isRequestInProgress || this.requestQueue.length === 0) {
      return;
    }
    const { requestFn, resolve, reject } = this.requestQueue.shift()!;
    this.isRequestInProgress = true;

    try {
      const response = await requestFn();
      resolve(response);
    } catch (error) {
      reject(error);
    } finally {
      this.isRequestInProgress = false;
      this.processQueue();
    }
  }

  public enqueueRequest<TResponse>(requestFn: () => Promise<TResponse>): Promise<TResponse> {
    return new Promise<TResponse>((resolve, reject) => {
      this.requestQueue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }
}

class ConcurrencyManager {
  private requestAborterInstance: RequestAborter;
  private requestQueuerInstance: RequestQueuer;

  constructor() {
    this.requestAborterInstance = new RequestAborter();
    this.requestQueuerInstance = new RequestQueuer();
  }

  public get requestAborter() {
    return this.requestAborterInstance;
  }

  public get requestQueuer() {
    return this.requestQueuerInstance;
  }
}

export { ConcurrencyManager };
