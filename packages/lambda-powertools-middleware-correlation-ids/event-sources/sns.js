const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')
const consts = require('../consts')

function isMatch (event) {
  if (!event.hasOwnProperty('Records')) {
    return false
  }

  if (!Array.isArray(event.Records)) {
    return false
  }

  return event.Records[0].EventSource === 'aws:sns'
}

function captureCorrelationIds ({ Records }, { awsRequestId }, sampleDebugLogRate) {
  const correlationIds = { awsRequestId }

  const snsRecord = Records[0].Sns
  const msgAttributes = snsRecord.MessageAttributes

  for (const msgAttribute in msgAttributes) {
    if (msgAttribute.toLowerCase().startsWith('x-correlation-')) {
      correlationIds[msgAttribute] = msgAttributes[msgAttribute].Value
    } else if (msgAttribute === consts.USER_AGENT) {
      correlationIds[consts.USER_AGENT] = msgAttributes[consts.USER_AGENT].Value
    } else if (msgAttribute === consts.DEBUG_LOG_ENABLED) {
      correlationIds[consts.DEBUG_LOG_ENABLED] = msgAttributes[consts.DEBUG_LOG_ENABLED].Value
    } else if (msgAttribute === consts.CALL_CHAIN_LENGTH) {
      correlationIds[consts.CALL_CHAIN_LENGTH] = parseInt(msgAttributes[consts.CALL_CHAIN_LENGTH].Value) + 1
    }
  }

  if (!correlationIds[consts.X_CORRELATION_ID]) {
    correlationIds[consts.X_CORRELATION_ID] = awsRequestId
  }

  if (!correlationIds[consts.DEBUG_LOG_ENABLED]) {
    correlationIds[consts.DEBUG_LOG_ENABLED] = Math.random() < sampleDebugLogRate ? 'true' : 'false'
  }

  if (!correlationIds[consts.CALL_CHAIN_LENGTH]) {
    correlationIds[consts.CALL_CHAIN_LENGTH] = 1
  }

  CorrelationIds.replaceAllWith(correlationIds)
}

module.exports = {
  isMatch,
  captureCorrelationIds
}
