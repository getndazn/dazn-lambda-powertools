import middy from "@middy/core";
import { Callback, Context } from "aws-lambda";
export * from "@buyerassist/dazn-lambda-powertools-middleware-correlation-ids";

declare enum FILTERING_MODE {
  BLACKLIST = "BLACKLIST",
  WHITELIST = "WHITELIST",
}

declare namespace dazn__lambda_powertools_pattern_obfuscate {
  const FILTERING_MODE: FILTERING_MODE;

  function obfuscaterPattern<
    TEvent = any,
    TResult = any,
    TContext extends Context = Context,
    TErr = Error
  >(
    obfuscationFilters: string[],
    f: (
      event: TEvent,
      context: TContext,
      callback: Callback<TResult>
    ) => void | Promise<TResult>,
    filterOnAfter?: boolean,
    filteringMode?: FILTERING_MODE
  ): middy.MiddyfiedHandler<TEvent, TResult, TErr>;
}

export default dazn__lambda_powertools_pattern_obfuscate;
