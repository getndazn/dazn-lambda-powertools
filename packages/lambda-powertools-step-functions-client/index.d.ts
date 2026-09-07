import { ServiceException } from "@smithy/smithy-client";
import { SFN as sfn, StartExecutionCommandInput, StartExecutionCommandOutput } from "@aws-sdk/client-sfn";
import CorrelationIds from "@dazn/lambda-powertools-correlation-ids";

declare const SFN: sfn & {
  startExecutionWithCorrelationIds(
    correlationId: CorrelationIds,
    params: StartExecutionCommandInput,
    callback?: (
      err: ServiceException,
      data: StartExecutionCommandOutput
    ) => void
  ): Promise<StartExecutionCommandOutput, ServiceException>;
};
export default SFN;
