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

export type ExtractedCorrelationIdAndLogger = {
  logger: Log;
  correlationIds: CorrelationIds;
};

export type SQSEvent = {
  Records: (SQSRecord & ExtractedCorrelationIdAndLogger)[];
};

export type SQSHandler = Handler<SQSEvent, void>;

export type KinesisContext<T> = Context & {
  parsedKinesisEvents: ((T & ExtractedCorrelationIdAndLogger) | undefined)[];
};

export type KinesisStreamHandler = <T>(
  event: KinesisStreamEvent,
  context: KinesisContext<T>,
  callback: Callback<void>
) => void | Promise<void>;

export type FirehoseContext<T> = Context & {
  parsedFirehoseEvents: ((T & ExtractedCorrelationIdAndLogger) | undefined)[];
};

export type FirehoseTransformationHandler = <T>(
  event: FirehoseTransformationEvent,
  context: FirehoseContext<T>,
  callback: Callback<FirehoseTransformationResult>
) => void | Promise<FirehoseTransformationResult>;

export type DynamoStreamsContext = Context & {
  parsedDynamoDbEvents: (DynamoDBRecord & ExtractedCorrelationIdAndLogger)[];
};

export type DynamoDBStreamHandler = (
  event: DynamoDBStreamEvent,
  context: DynamoStreamsContext,
  callback: Callback<void>
) => void | Promise<void>;
