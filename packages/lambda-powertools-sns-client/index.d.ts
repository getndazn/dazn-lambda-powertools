import awsSNS from "aws-sdk/clients/sns";
import { AWSError } from "aws-sdk/lib/error";
import { Request } from "aws-sdk/lib/request";
import CorrelationIds from "@buyerassist/dazn-lambda-powertools-correlation-ids";

declare const SNS: awsSNS & {
  publishWithCorrelationIds(
    correlationId: CorrelationIds,
    params: awsSNS.Types.PublishInput,
    callback?: (err: AWSError, data: awsSNS.Types.PublishResponse) => void
  ): Request<awsSNS.Types.PublishResponse, AWSError>;
  publishBatchWithCorrelationIds(
    correlationId: CorrelationIds,
    params: awsSNS.Types.PublishBatchInput,
    callback?: (err: AWSError, data: awsSNS.Types.PublishBatchResponse) => void
  ): Request<awsSNS.Types.PublishBatchResponse, AWSError>;
}
export default SNS;
