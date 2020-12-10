export = dazn__lambda_powertools_correlation_ids;

interface IContext {
  [key: string]: any;
}

declare class dazn__lambda_powertools_correlation_ids {
  constructor(context?: IContext);

  clearAll(): void;

  get(): IContext;

  replaceAllWith(ctx: IContext): void;

  set(key: string, value: any): void;

  static clearAll(): void;

  static get(): IContext;

  static replaceAllWith(ctx: IContext): void;

  static set(key: string, value: any): void;

  get debugLoggingEnabled(): boolean;
  set debugLoggingEnabled(enabled: boolean);

  static get debugLoggingEnabled(): boolean;
  static set debugLoggingEnabled(enabled: boolean);
}
