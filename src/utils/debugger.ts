class Debugger {
  private static isDebugMode: boolean = false;

  private constructor() {}

  public static setDebugMode(debugMode: boolean): void {
    this.isDebugMode = debugMode;
  }

  public static log(debugMessage: string): void {
    if (this.isDebugMode) {
      // eslint-disable-next-line no-console
      console.debug(`[EasyRequester_DEBUG]: ${debugMessage}`);
    }
    return;
  }

  public static error(errorMessage: string): void {
    if (this.isDebugMode) {
      // eslint-disable-next-line no-console
      console.debug(`[EasyRequester_ERROR]: ${errorMessage}`);
    }
    throw new Error(`[EasyRequester_ERROR]: ${errorMessage}`);
  }
}

export default Debugger;
