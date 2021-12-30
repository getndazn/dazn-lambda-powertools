import StepFunctions from "aws-sdk/clients/stepfunctions";
import { AWSError } from "aws-sdk/lib/error";
import { Request } from "aws-sdk/lib/request";
import CorrelationIds from "@buyerassist/dazn-lambda-powertools-correlation-ids";

declare const SFN: StepFunctions & {
  startExecutionWithCorrelationIds(
    correlationId: CorrelationIds,
    params: StepFunctions.Types.StartExecutionInput,
    callback?: (
      err: AWSError,
      data: StepFunctions.Types.StartExecutionOutput
    ) => void
  ): Request<StepFunctions.Types.StartExecutionOutput, AWSError>;
};
export default SFN;
