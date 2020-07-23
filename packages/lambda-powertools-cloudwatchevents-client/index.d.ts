import awsCloudWatchEvents from "aws-sdk/clients/cloudwatchevents";
import { AWSError } from "aws-sdk/lib/error";
import { Request } from "aws-sdk/lib/request";
import CorrelationIds from "@dazn/lambda-powertools-correlation-ids";

declare const CloudWatchEvents: awsCloudWatchEvents & {
  putEventsWithCorrelationIds(
    correlationId: CorrelationIds,
    params: awsCloudWatchEvents.Types.PutEventsRequest,
    callback?: (
      err: AWSError,
      data: awsCloudWatchEvents.Types.PutEventsResponse
    ) => void
  ): Request<awsCloudWatchEvents.Types.PutEventsResponse, AWSError>;
};
export default CloudWatchEvents;
