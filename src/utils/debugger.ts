class Debugger {
  private static instance: Debugger;
  private static isDebugMode: boolean = false;

  private constructor() {}

  public static setDebugMode(debugMode: boolean): void {
    this.isDebugMode = debugMode;
  }

  public static log(message: string, data?: object | string): void {
    if (this.isDebugMode) {
      const formattedData = data ? `: ${JSON.stringify(data)}` : "";
      // eslint-disable-next-line no-console
      console.debug(`[EasyRequester_DEBUG]: ${message}${formattedData}`);
    }
  }
}

export default Debugger;
