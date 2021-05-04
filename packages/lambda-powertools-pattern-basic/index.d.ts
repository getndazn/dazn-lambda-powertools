import middy from "@middy/core";
import { Callback, Context } from "aws-lambda";
export * from "@dazn/lambda-powertools-middleware-correlation-ids";

export default function <
  TEvent = any,
  TResult = any,
  TContext extends Context = Context,
  TErr = Error
>(
  f: (
    event: TEvent,
    context: TContext,
    callback: Callback<TResult>
  ) => void | Promise<TResult>
): middy.MiddyfiedHandler<TEvent, TResult, TErr>;
