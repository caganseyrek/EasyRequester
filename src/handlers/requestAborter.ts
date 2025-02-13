import Logger from "@/utils/logger";

/**
 * A utility class to manage aborting requests using `AbortController`.
 * This class ensures that only the latest request for a given URL is active,
 * and any previous requests are aborted when a new one is initiated.
 */
class RequestAborter {
  private controllers: Map<string, AbortController>;
  private abortController?: AbortController;

  constructor() {
    this.controllers = new Map();
  }

  /**
   * Gets the map of controllers currently managing active requests.
   * The key is the generated URL for each request, and the value is the corresponding `AbortController`.
   *
   * @returns {Map<string, AbortController>} The map of controllers for active requests.
   */
  public getControllers(): Map<string, AbortController> {
    return this.controllers;
  }

  /**
   * Sets up an `AbortController` for a new request.
   * If there is already an active request for the same URL, the previous request will be aborted.
   *
   * @param {string} generatedURL - The URL associated with the request.
   * @param {RequestInit} requestConfig - The configuration object for the request, where `signal` will be set to the `AbortController` signal.
   *
   * @returns {void}
   */
  public setupAbortController(generatedURL: string, requestConfig: RequestInit): void {
    this.abortController = new AbortController();
    requestConfig.signal = this.abortController.signal;

    if (this.controllers.has(generatedURL)) {
      Logger.info(this.setupAbortController.name, "Aborted previous request due to being received a new request.");
      const previousController = this.controllers.get(generatedURL);
      previousController?.abort();
    }
    this.controllers.set(generatedURL, this.abortController);
  }

  /**
   * Handles the cleanup of aborted requests by removing the controller from the map.
   *
   * @param {string} generatedURL - The URL of the aborted request.
   *
   * @returns {void}
   */
  public handleAbortError(generatedURL: string): void {
    this.getControllers().delete(generatedURL);
  }
}

export default RequestAborter;
