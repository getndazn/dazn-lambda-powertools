const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')
const Log = require('@perform/lambda-powertools-logger')
const consts = require('./../consts')

function isMatch (event) {
  if (!event.hasOwnProperty('Records')) {
    return false
  }

  if (!Array.isArray(event.Records)) {
    return false
  }

  return event.Records[0].eventSource === 'aws:sqs'
}

function captureCorrelationIds (event, context, sampleDebugLogRate) {
  const awsRequestId = context.awsRequestId
  event.Records.forEach(record => {
    // the wrapped sqs client would put the correlation IDs in the MessageAttributes
    const msgAttributes = { ...record.messageAttributes }
    const correlationIds = { awsRequestId }

    // try retrieve message attributes from sns->sqs subscriptions
    // where raw message delivery is disabled
    if (Object.entries(msgAttributes).length === 0) {
      let body = {}
      try {
        body = JSON.parse(record.body)
      } catch (e) {
      }

      if (body.hasOwnProperty('MessageAttributes') &&
        body.hasOwnProperty('TopicArn') &&
        body.TopicArn.startsWith('arn:aws:sns')
      ) {
        for (const bodyMsgAttribute in body.MessageAttributes) {
          const stringValue = body.MessageAttributes[bodyMsgAttribute].Value
          msgAttributes[bodyMsgAttribute] = { stringValue }
        }
      }
    }

    for (const msgAttribute in msgAttributes) {
      if (msgAttribute.toLowerCase().startsWith('x-correlation-')) {
        correlationIds[msgAttribute] = msgAttributes[msgAttribute].stringValue
      } else if (msgAttribute === consts.USER_AGENT) {
        correlationIds[consts.USER_AGENT] = msgAttributes[consts.USER_AGENT].stringValue
      } else if (msgAttribute === consts.DEBUG_LOG_ENABLED) {
        correlationIds[consts.DEBUG_LOG_ENABLED] = msgAttributes[consts.DEBUG_LOG_ENABLED].stringValue
      } else if (msgAttribute === consts.CALL_CHAIN_LENGTH) {
        correlationIds[consts.CALL_CHAIN_LENGTH] = parseInt(msgAttributes[consts.CALL_CHAIN_LENGTH].stringValue) + 1
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

    const correlationIdsInstance = new CorrelationIds(correlationIds)

    Object.defineProperties(record, {
      correlationIds: {
        value: correlationIdsInstance,
        enumerable: false
      },
      logger: {
        value: new Log({ correlationIds: correlationIdsInstance }),
        enumerable: false
      }
    })
  })

  // although we're going to have per-record correlation IDs, the default one for the function
  // should still have the awsRequestId at least
  CorrelationIds.replaceAllWith({
    'x-correlation-id': awsRequestId,
    awsRequestId,
    [consts.DEBUG_LOG_ENABLED]: Math.random() < sampleDebugLogRate ? 'true' : 'false'
  })
}

module.exports = {
  isMatch,
  captureCorrelationIds
}
