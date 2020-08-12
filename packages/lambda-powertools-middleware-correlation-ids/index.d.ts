import middy from "@middy/core";
import {
  Context,
  SQSRecord,
  Handler,
  DynamoDBRecord,
  DynamoDBStreamEvent,
  Callback,
  FirehoseTransformationEvent,
  FirehoseTransformationResult,
  KinesisStreamEvent,
} from "aws-lambda";
import Log from "@dazn/lambda-powertools-logger";
import CorrelationIds from "@dazn/lambda-powertools-correlation-ids";

export default function <T, R, C extends Context = Context>(params: {
  sampleDebugLogRate: number;
}): middy.MiddlewareObject<T, R, C>;

export type ExtractedCorrelationIdAndLogger<L = Log> = {
  logger: L;
  correlationIds: CorrelationIds;
};

export type SQSEvent<L = Log> = {
  Records: (SQSRecord & ExtractedCorrelationIdAndLogger<L>)[];
};

export type SQSHandler<L = Log> = Handler<SQSEvent<L>, void>;

export type KinesisContext<T, L = Log> = Context & {
  parsedKinesisEvents: ((T & ExtractedCorrelationIdAndLogger<L>) | undefined)[];
};

export type KinesisStreamHandler<T, L = Log> = (
  event: KinesisStreamEvent,
  context: KinesisContext<T, L>,
  callback: Callback<void>
) => void | Promise<void>;

export type FirehoseContext<T, L = Log> = Context & {
  parsedFirehoseEvents: (
    | (T & ExtractedCorrelationIdAndLogger<L>)
    | undefined
  )[];
};

export type FirehoseTransformationHandler<T, L = Log> = (
  event: FirehoseTransformationEvent,
  context: FirehoseContext<T, L>,
  callback: Callback<FirehoseTransformationResult>
) => void | Promise<FirehoseTransformationResult>;

export type DynamoStreamsContext<L = Log> = Context & {
  parsedDynamoDbEvents: (DynamoDBRecord & ExtractedCorrelationIdAndLogger<L>)[];
};

export type DynamoDBStreamHandler<L = Log> = (
  event: DynamoDBStreamEvent,
  context: DynamoStreamsContext<L>,
  callback: Callback<void>
) => void | Promise<void>;
