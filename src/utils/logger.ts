class Logger {
  private static isDebugMode: boolean = false;

  private constructor() {}

  public static setDebugMode(debugMode: boolean): void {
    this.isDebugMode = debugMode;
  }

  /**
   * Logs a debug message to the console when debug mode is enabled.
   * The message will include the specified location and message.
   *
   * @param {string} location - The location (e.g., method name) where the log is being generated.
   * @param {string} debugMessage - The debug message to log.
   * @returns {void}
   */
  public static info(location: string, debugMessage: string): void {
    if (this.isDebugMode) {
      // eslint-disable-next-line no-console
      console.debug(`[EasyRequester_DEBUG] ${debugMessage} at ${location}`);
    }
  }

  /**
   * Logs an error message to the console and throws an error when debug mode is enabled.
   * The message will include the specified location and error message.
   *
   * @param {string} location - The location (e.g., method name) where the error occurred.
   * @param {string} errorMessage - The error message to log.
   * @throws {Error} Throws a new `Error` with the provided error message.
   * @returns {void}
   */
  public static error(location: string, errorMessage: string): void {
    if (this.isDebugMode) {
      // eslint-disable-next-line no-console
      console.debug(`[EasyRequester_ERROR] ${errorMessage} at ${location}`);
    }
    throw new Error(`EasyRequesterError: ${errorMessage} at ${location}`);
  }
}

export default Logger;
