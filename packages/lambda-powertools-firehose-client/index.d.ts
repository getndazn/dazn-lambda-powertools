import awsFirehose from "aws-sdk/clients/firehose";
import { AWSError } from "aws-sdk/lib/error";
import { Request } from "aws-sdk/lib/request";
import CorrelationIds from "@dazn/lambda-powertools-correlation-ids";

declare const Firehose: awsFirehose & {
  putRecordWithCorrelationIds(
    correlationId: CorrelationIds,
    params: awsFirehose.Types.PutRecordInput,
    callback?: (err: AWSError, data: awsFirehose.Types.PutRecordOutput) => void
  ): Request<awsFirehose.Types.PutRecordOutput, AWSError>;

  putRecordBatchWithCorrelationIds(
    correlationId: CorrelationIds,
    params: awsFirehose.Types.PutRecordBatchInput,
    callback?: (
      err: AWSError,
      data: awsFirehose.Types.PutRecordBatchOutput
    ) => void
  ): Request<awsFirehose.Types.PutRecordBatchOutput, AWSError>;
};
export default Firehose;
