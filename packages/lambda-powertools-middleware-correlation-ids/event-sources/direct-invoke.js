const CorrelationIds = require("@buyerassist/dazn-lambda-powertools-correlation-ids");
const consts = require("../consts");

function isMatch(event) {
  return event.hasOwnProperty("__context__");
}

function captureCorrelationIds(
  { __context__ },
  { awsRequestId },
  sampleDebugLogRate
) {
  const correlationIds = __context__ || {};
  correlationIds.awsRequestId = awsRequestId;
  if (!correlationIds[consts.X_CORRELATION_ID]) {
    correlationIds[consts.X_CORRELATION_ID] = awsRequestId;
  }

  if (!correlationIds[consts.DEBUG_LOG_ENABLED]) {
    correlationIds[consts.DEBUG_LOG_ENABLED] =
      Math.random() < sampleDebugLogRate ? "true" : "false";
  }

  correlationIds[consts.CALL_CHAIN_LENGTH] =
    (correlationIds[consts.CALL_CHAIN_LENGTH] || 0) + 1;

  CorrelationIds.replaceAllWith(correlationIds);
}

module.exports = {
  isMatch,
  captureCorrelationIds,
};
