import CorrelationIds from "@dazn/lambda-powertools-correlation-ids";
export = dazn__lambda_powertools_logger;
declare enum LogLevels {
  DEBUG = 20,
  INFO = 30,
  WARN = 40,
  ERROR = 50,
}

declare class dazn__lambda_powertools_logger {
  correlationIds: CorrelationIds;
  originalLevel: string;
  level: string;
  constructor(argument?: { correlationIds?: CorrelationIds; level?: string });

  appendError<T>(params: T, err: Error): T & Error;

  debug(message: string, params?: Record<string, any>): void;

  enableDebug(): () => void;

  error(message: string, err?: Error): void;
  error(message: string, params?: Record<string, any>, err?: Error): void;

  info(message: string, params?: Record<string, any>): void;

  isEnabled(level: 20 | 30 | 40 | 50): Boolean;

  log(levelName: string, message: string, params?: Record<string, any>): void;

  resetLevel(): void;

  warn(message: string, err?: Error): void;
  warn(message: string, params?: Record<string, any>, err?: Error): void;

  static debug(message: string, params?: Record<string, any>): void;

  static enableDebug(): () => void;

  static error(message: string, err?: Error): void;
  static error(
    message: string,
    params?: Record<string, any>,
    err?: Error
  ): void;

  static info(message: string, params?: Record<string, any>): void;

  static level: string;

  static resetLevel(): void;

  static warn(message: string, err?: Error): void;
  static warn(message: string, params?: any, err?: Error): void;
}
