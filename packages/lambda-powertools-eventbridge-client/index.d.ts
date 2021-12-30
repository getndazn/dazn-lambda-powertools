import awsEventBridge from "aws-sdk/clients/eventbridge";
import { AWSError } from "aws-sdk/lib/error";
import { Request } from "aws-sdk/lib/request";
import CorrelationIds from "@buyerassist/dazn-lambda-powertools-correlation-ids";

declare const EventBridge: awsEventBridge & {
  putEventsWithCorrelationIds(
    correlationId: CorrelationIds,
    params: awsEventBridge.Types.PutEventsRequest,
    callback?: (
      err: AWSError,
      data: awsEventBridge.Types.PutEventsResponse
    ) => void
  ): Request<awsEventBridge.Types.PutEventsResponse, AWSError>;
};
export default EventBridge;
