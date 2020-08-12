import middy from "@middy/core";
import { Callback, Context } from "aws-lambda";
export * from "@dazn/lambda-powertools-middleware-correlation-ids";

declare type EventType<T, C> = T extends (
  event: infer EventArgType,
  context: C,
  callback: Callback<any>
) => void
  ? EventArgType
  : T extends (event: infer EventArgType, context: C) => Promise<any>
  ? EventArgType
  : never;

declare type HandlerReturnType<T, C> = T extends (
  event: any,
  context: C
) => Promise<infer RetType>
  ? RetType
  : T extends (
      event: any,
      context: C,
      callback: Callback<infer RetType>
    ) => void
  ? RetType
  : never;

declare type AsyncHandler<C extends Context> =
  | ((event: any, context: C, callback: Callback<any>) => void)
  | ((event: any, context: C) => Promise<any>);

declare enum FILTERING_MODE {
  BLACKLIST = "BLACKLIST",
  WHITELIST = "WHITELIST",
}

declare namespace dazn__lambda_powertools_pattern_obfuscate {
  const FILTERING_MODE: FILTERING_MODE;

  function obfuscaterPattern<
    H extends AsyncHandler<C>,
    C extends Context = Context
  >(
    obfuscationFilters: string[],
    f: H,
    filterOnAfter?: boolean,
    filteringMode?: FILTERING_MODE
  ): middy.Middy<EventType<H, C>, HandlerReturnType<H, C>, C>;
}

export default dazn__lambda_powertools_pattern_obfuscate;
