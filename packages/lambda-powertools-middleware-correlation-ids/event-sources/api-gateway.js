const CorrelationIds = require('@dazn/lambda-powertools-correlation-ids')
const Log = require('@dazn/lambda-powertools-logger')
const consts = require('../consts')

function isMatch (event) {
  return event.hasOwnProperty('httpMethod') && event.requestContext && !event.requestContext.hasOwnProperty('elb')
}

function captureCorrelationIds ({ requestContext, headers }, { awsRequestId }, sampleDebugLogRate) {
  if (!headers) {
    Log.warn(`Request ${awsRequestId} is missing headers`)
    return
  }

  const apiGatewayRequestId = requestContext ? requestContext.requestId : undefined
  const correlationIds = { awsRequestId, apiGatewayRequestId }
  for (const header in headers) {
    if (header.toLowerCase().startsWith('x-correlation-')) {
      correlationIds[header] = headers[header]
    }
  }

  if (!correlationIds[consts.X_CORRELATION_ID]) {
    correlationIds[consts.X_CORRELATION_ID] = apiGatewayRequestId || awsRequestId
  }

  // forward the original User-Agent on
  if (headers[consts.USER_AGENT]) {
    correlationIds[consts.USER_AGENT] = headers[consts.USER_AGENT]
  }

  if (headers[consts.DEBUG_LOG_ENABLED]) {
    correlationIds[consts.DEBUG_LOG_ENABLED] = headers[consts.DEBUG_LOG_ENABLED]
  } else {
    correlationIds[consts.DEBUG_LOG_ENABLED] = Math.random() < sampleDebugLogRate ? 'true' : 'false'
  }

  if (headers[consts.CALL_CHAIN_LENGTH]) {
    correlationIds[consts.CALL_CHAIN_LENGTH] = parseInt(headers[consts.CALL_CHAIN_LENGTH]) + 1
  } else {
    correlationIds[consts.CALL_CHAIN_LENGTH] = 1 // start with 1, i.e. first call in the chain
  }

  CorrelationIds.replaceAllWith(correlationIds)
}

module.exports = {
  isMatch,
  captureCorrelationIds
}
