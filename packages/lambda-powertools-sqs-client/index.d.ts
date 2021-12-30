import awsSQS from "aws-sdk/clients/sqs";
import { AWSError } from "aws-sdk/lib/error";
import { Request } from "aws-sdk/lib/request";
import CorrelationIds from "@buyerassist/dazn-lambda-powertools-correlation-ids";

declare const SQS: awsSQS & {
  sendMessageWithCorrelationIds(
    correlationId: CorrelationIds,
    params: awsSQS.Types.SendMessageRequest,
    callback?: (err: AWSError, data: awsSQS.Types.SendMessageResult) => void
  ): Request<awsSQS.Types.SendMessageResult, AWSError>;

  sendMessageBatchWithCorrelationIds(
    correlationId: CorrelationIds,
    params: awsSQS.Types.SendMessageBatchRequest,
    callback?: (
      err: AWSError,
      data: awsSQS.Types.SendMessageBatchResult
    ) => void
  ): Request<awsSQS.Types.SendMessageBatchResult, AWSError>;
};
export default SQS;
