import awsLambda from "aws-sdk/clients/lambda";
import { AWSError } from "aws-sdk/lib/error";
import { Request } from "aws-sdk/lib/request";
import CorrelationIds from "@buyerassist/dazn-lambda-powertools-correlation-ids";

declare const Lambda: awsLambda & {
  invokeWithCorrelationIds(
    correlationId: CorrelationIds,
    params: awsLambda.Types.InvocationRequest,
    callback?: (err: AWSError, data: awsLambda.Types.InvocationResponse) => void
  ): Request<awsLambda.Types.InvocationResponse, AWSError>;
  invokeAsyncWithCorrelationIds(
    correlationId: CorrelationIds,
    params: awsLambda.Types.InvokeAsyncRequest,
    callback?: (
      err: AWSError,
      data: awsLambda.Types.InvokeAsyncResponse
    ) => void
  ): Request<awsLambda.Types.InvokeAsyncResponse, AWSError>;
};
export default Lambda;
