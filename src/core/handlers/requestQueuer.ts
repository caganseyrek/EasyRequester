import type { RequestQueueProps } from "@/types/internals";

import Logger from "@/utils/logger";

/**
 * A utility class to manage a queue of requests.
 * This class ensures that requests are processed sequentially, preventing multiple concurrent requests.
 */
class RequestQueuer {
  private requestQueue: RequestQueueProps[] = [];
  private isRequestInProgress: boolean = false;

  constructor() {}

  /**
   * Processes the next request in the queue.
   * If a request is already in progress or the queue is empty, the method will return early.
   * Otherwise, it will execute the next request and handle its result or error.
   *
   * @private
   * @returns {Promise<void>} Resolves when the queue processing is complete.
   */
  private async processQueue(): Promise<void> {
    if (this.isRequestInProgress || this.requestQueue.length === 0) {
      return;
    }
    const { requestFn, resolve, reject } = this.requestQueue.shift()!;
    this.isRequestInProgress = true;

    Logger.info(requestFn.name, "Processing request queue");
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

  /**
   * Enqueues a request to be processed in the queue.
   * This method wraps the request function in a `Promise` and adds it to the queue.
   * It ensures requests are processed one at a time.
   *
   * @param {() => Promise<TResponse>} requestFn - A function that returns a promise, representing the request to be processed.
   * @returns {Promise<TResponse>} A promise that resolves with the response of the request.
   */
  public enqueueRequest<TResponse>(requestFn: () => Promise<TResponse>): Promise<TResponse> {
    return new Promise<TResponse>((resolve, reject) => {
      this.requestQueue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }
}

export default RequestQueuer;
