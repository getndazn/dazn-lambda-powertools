import middy from "@middy/core";
import {
  Context,
  SQSRecord,
  DynamoDBRecord,
  DynamoDBStreamEvent,
  Callback,
  FirehoseTransformationEvent,
  FirehoseTransformationResult,
  KinesisStreamEvent,
} from "aws-lambda";
import Log from "@dazn/lambda-powertools-logger";
import CorrelationIds from "@dazn/lambda-powertools-correlation-ids";

export default function <TEvent = any, TResult = any, TErr = Error>(params: {
  sampleDebugLogRate: number;
}): middy.MiddlewareObj<TEvent, TResult, TErr>;

export type ExtractedCorrelationIdAndLogger<L = Log> = {
  logger: L;
  correlationIds: CorrelationIds;
};

export type Handler<
  TEvent = any,
  TResult = any,
  TContext extends Context = Context
> = (
  event: TEvent,
  context: TContext,
  callback: Callback<TResult>
) => void | Promise<TResult>;

export type SQSEvent<L = Log> = {
  Records: (SQSRecord & ExtractedCorrelationIdAndLogger<L>)[];
};

export type SQSHandler = Handler<SQSEvent, void>;

export type KinesisContext<T, L = Log> = Context & {
  parsedKinesisEvents: ((T & ExtractedCorrelationIdAndLogger<L>) | undefined)[];
};

export type KinesisStreamHandler<T> = Handler<
  KinesisStreamEvent,
  void,
  KinesisContext<T>
>;

export type FirehoseContext<T, L = Log> = Context & {
  parsedFirehoseEvents: (
    | (T & ExtractedCorrelationIdAndLogger<L>)
    | undefined
  )[];
};

export type FirehoseTransformationHandler<T> = Handler<
  FirehoseTransformationEvent,
  FirehoseTransformationResult,
  FirehoseContext<T>
>;

export type DynamoStreamsContext = Context & {
  parsedDynamoDbEvents: (DynamoDBRecord & ExtractedCorrelationIdAndLogger)[];
};

export type DynamoDBStreamHandler = Handler<
  DynamoDBStreamEvent,
  void,
  DynamoStreamsContext
>;
