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

export default function <
  H extends AsyncHandler<C>,
  C extends Context = Context
>(f: H): middy.Middy<EventType<H, C>, HandlerReturnType<H, C>, C>;
