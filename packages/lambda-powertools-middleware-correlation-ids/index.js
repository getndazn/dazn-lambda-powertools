const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')
const Log = require('@perform/lambda-powertools-logger')

const X_CORRELATION_ID = 'x-correlation-id'
const DEBUG_LOG_ENABLED = 'debug-log-enabled'
const USER_AGENT = 'User-Agent'

function captureHttp ({ headers }, { awsRequestId }, sampleDebugLogRate) {
  if (!headers) {
    Log.warn(`Request ${awsRequestId} is missing headers`)
    return
  }

  const correlationIds = { awsRequestId }
  for (const header in headers) {
    if (header.toLowerCase().startsWith('x-correlation-')) {
      correlationIds[header] = headers[header]
    }
  }

  if (!correlationIds[X_CORRELATION_ID]) {
    correlationIds[X_CORRELATION_ID] = awsRequestId
  }

  // forward the original User-Agent on
  if (headers[USER_AGENT]) {
    correlationIds[USER_AGENT] = headers[USER_AGENT]
  }

  if (headers[DEBUG_LOG_ENABLED]) {
    correlationIds[DEBUG_LOG_ENABLED] = headers[DEBUG_LOG_ENABLED]
  } else {
    correlationIds[DEBUG_LOG_ENABLED] = Math.random() < sampleDebugLogRate ? 'true' : 'false'
  }

  CorrelationIds.replaceAllWith(correlationIds)
}

function captureSns ({ Records }, { awsRequestId }, sampleDebugLogRate) {
  const correlationIds = { awsRequestId }

  const snsRecord = Records[0].Sns
  const msgAttributes = snsRecord.MessageAttributes

  for (const msgAttribute in msgAttributes) {
    if (msgAttribute.toLowerCase().startsWith('x-correlation-')) {
      correlationIds[msgAttribute] = msgAttributes[msgAttribute].Value
    } else if (msgAttribute === USER_AGENT) {
      correlationIds[USER_AGENT] = msgAttributes[USER_AGENT].Value
    } else if (msgAttribute === DEBUG_LOG_ENABLED) {
      correlationIds[DEBUG_LOG_ENABLED] = msgAttributes[DEBUG_LOG_ENABLED].Value
    }
  }

  if (!correlationIds[X_CORRELATION_ID]) {
    correlationIds[X_CORRELATION_ID] = awsRequestId
  }

  if (!correlationIds[DEBUG_LOG_ENABLED]) {
    correlationIds[DEBUG_LOG_ENABLED] = Math.random() < sampleDebugLogRate ? 'true' : 'false'
  }

  CorrelationIds.replaceAllWith(correlationIds)
}

function captureSqs (event, context, sampleDebugLogRate) {
  const awsRequestId = context.awsRequestId
  event.Records.forEach(record => {
    // the wrapped sqs client would put the correlation IDs in the MessageAttributes
    const msgAttributes = record.messageAttributes
    const correlationIds = { awsRequestId }

    for (const msgAttribute in msgAttributes) {
      if (msgAttribute.toLowerCase().startsWith('x-correlation-')) {
        correlationIds[msgAttribute] = msgAttributes[msgAttribute].stringValue
      } else if (msgAttribute === USER_AGENT) {
        correlationIds[USER_AGENT] = msgAttributes[USER_AGENT].stringValue
      } else if (msgAttribute === DEBUG_LOG_ENABLED) {
        correlationIds[DEBUG_LOG_ENABLED] = msgAttributes[DEBUG_LOG_ENABLED].stringValue
      }
    }

    if (!correlationIds[X_CORRELATION_ID]) {
      correlationIds[X_CORRELATION_ID] = awsRequestId
    }

    if (!correlationIds[DEBUG_LOG_ENABLED]) {
      correlationIds[DEBUG_LOG_ENABLED] = Math.random() < sampleDebugLogRate ? 'true' : 'false'
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
    [DEBUG_LOG_ENABLED]: Math.random() < sampleDebugLogRate ? 'true' : 'false'
  })
}

function captureKinesis ({ Records }, context, sampleDebugLogRate) {
  const awsRequestId = context.awsRequestId
  const events = Records
    .map(record => {
      const json = Buffer.from(record.kinesis.data, 'base64').toString('utf8')
      const event = JSON.parse(json)

      // the wrapped kinesis client would put the correlation IDs as part of
      // the payload as a special __context__ property
      const correlationIds = event.__context__ || {}
      correlationIds.awsRequestId = awsRequestId

      delete event.__context__

      if (!correlationIds[X_CORRELATION_ID]) {
        correlationIds[X_CORRELATION_ID] = awsRequestId
      }

      if (!correlationIds[DEBUG_LOG_ENABLED]) {
        correlationIds[DEBUG_LOG_ENABLED] = Math.random() < sampleDebugLogRate ? 'true' : 'false'
      }

      const correlationIdsInstance = new CorrelationIds(correlationIds)

      Object.defineProperties(event, {
        correlationIds: {
          value: correlationIdsInstance,
          enumerable: false
        },
        logger: {
          value: new Log({ correlationIds: correlationIdsInstance }),
          enumerable: false
        }
      })

      return event
    })

  context.parsedKinesisEvents = events

  // although we're going to have per-record correlation IDs, the default one for the function
  // should still have the awsRequestId at least
  CorrelationIds.replaceAllWith({
    'x-correlation-id': awsRequestId,
    awsRequestId,
    [DEBUG_LOG_ENABLED]: Math.random() < sampleDebugLogRate ? 'true' : 'false'
  })
}

function captureContextField ({ __context__ }, { awsRequestId }, sampleDebugLogRate) {
  const correlationIds = __context__ || {}
  correlationIds.awsRequestId = awsRequestId
  if (!correlationIds[X_CORRELATION_ID]) {
    correlationIds[X_CORRELATION_ID] = awsRequestId
  }

  if (!correlationIds[DEBUG_LOG_ENABLED]) {
    correlationIds[DEBUG_LOG_ENABLED] = Math.random() < sampleDebugLogRate ? 'true' : 'false'
  }

  CorrelationIds.replaceAllWith(correlationIds)
}

function initCorrelationIds ({ awsRequestId }, sampleDebugLogRate) {
  const correlationIds = { awsRequestId }
  correlationIds[X_CORRELATION_ID] = awsRequestId
  correlationIds[DEBUG_LOG_ENABLED] = Math.random() < sampleDebugLogRate ? 'true' : 'false'

  CorrelationIds.replaceAllWith(correlationIds)
}

function isApiGatewayEvent (event) {
  return event.hasOwnProperty('httpMethod')
}

function isSnsEvent (event) {
  if (!event.hasOwnProperty('Records')) {
    return false
  }

  if (!Array.isArray(event.Records)) {
    return false
  }

  return event.Records[0].EventSource === 'aws:sns'
}

function isSqsEvent (event) {
  if (!event.hasOwnProperty('Records')) {
    return false
  }

  if (!Array.isArray(event.Records)) {
    return false
  }

  return event.Records[0].eventSource === 'aws:sqs'
}

function isKinesisEvent (event) {
  if (!event.hasOwnProperty('Records')) {
    return false
  }

  if (!Array.isArray(event.Records)) {
    return false
  }

  return event.Records[0].eventSource === 'aws:kinesis'
}

function hasContextField (event) {
  return event.hasOwnProperty('__context__')
}

module.exports = ({ sampleDebugLogRate }) => {
  return {
    before: (handler, next) => {
      CorrelationIds.clearAll()

      const { event, context } = handler

      if (isApiGatewayEvent(event)) {
        captureHttp(event, context, sampleDebugLogRate)
      } else if (isSnsEvent(event)) {
        captureSns(event, context, sampleDebugLogRate)
      } else if (isSqsEvent(event)) {
        captureSqs(event, context, sampleDebugLogRate)
      } else if (isKinesisEvent(event)) {
        captureKinesis(event, context, sampleDebugLogRate)
      } else if (hasContextField(event)) {
        captureContextField(event, context, sampleDebugLogRate)
      } else {
        initCorrelationIds(context, sampleDebugLogRate)
      }

      next()
    }
  }
}
