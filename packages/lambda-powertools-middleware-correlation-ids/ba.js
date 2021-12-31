const consts = require("./consts");
const uuid = require("uuid");
const updateBARelatedCorrelationIds = (correlationIds) => {
  // BuyerAssist Logic to generate SpanIds/TraceIds
  const spanId = generateSpanId();
  if (!correlationIds[consts.X_CORRELATION_TRACE_ID]) {
    correlationIds[consts.X_CORRELATION_TRACE_ID] = generateTraceId();
  }
  if (correlationIds[consts.X_CORRELATION_SPAN_ID]) {
    correlationIds[consts.X_CORRELATION_PARENT_ID] =
      correlationIds[consts.X_CORRELATION_SPAN_ID];
  }
  correlationIds[consts.X_CORRELATION_SPAN_ID] = spanId;
};
const generateTraceId = () => {
  return uuid.v1();
};
const generateSpanId = () => {
  return `${uuid.v1()}-${process.env.SRV_DISPLAY_NAME}`;
};
module.exports = {
  updateBARelatedCorrelationIds,
};
