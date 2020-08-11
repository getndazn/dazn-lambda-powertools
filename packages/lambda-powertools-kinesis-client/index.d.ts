import awsKinesis from "aws-sdk/clients/kinesis";
import { AWSError } from "aws-sdk/lib/error";
import { Request } from "aws-sdk/lib/request";
import CorrelationIds from "@dazn/lambda-powertools-correlation-ids";

declare const Kinesis: awsKinesis & {
  putRecordWithCorrelationIds(
    correlationId: CorrelationIds,
    params: awsKinesis.Types.PutRecordInput,
    callback?: (err: AWSError, data: awsKinesis.Types.PutRecordOutput) => void
  ): Request<awsKinesis.Types.PutRecordOutput, AWSError>;
  putRecordsWithCorrelationIds(
    correlationId: CorrelationIds,
    params: awsKinesis.Types.PutRecordsInput,
    callback?: (err: AWSError, data: awsKinesis.Types.PutRecordsOutput) => void
  ): Request<awsKinesis.Types.PutRecordsOutput, AWSError>;
};
export default Kinesis;
