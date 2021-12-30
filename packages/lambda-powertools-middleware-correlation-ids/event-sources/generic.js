const CorrelationIds = require("@buyerassist/dazn-lambda-powertools-correlation-ids");
const consts = require("../consts");

function isMatch(event) {
  return true;
}

function captureCorrelationIds(event, { awsRequestId }, sampleDebugLogRate) {
  const correlationIds = { awsRequestId };
  correlationIds[consts.X_CORRELATION_ID] = awsRequestId;
  correlationIds[consts.DEBUG_LOG_ENABLED] =
    Math.random() < sampleDebugLogRate ? "true" : "false";
  correlationIds[consts.CALL_CHAIN_LENGTH] = 1;

  CorrelationIds.replaceAllWith(correlationIds);
}

module.exports = {
  isMatch,
  captureCorrelationIds,
};
