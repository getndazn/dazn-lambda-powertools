const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')
const Log = require('@perform/lambda-powertools-logger')

const X_CORRELATION_ID  = 'x-correlation-id'
const DEBUG_LOG_ENABLED = 'debug-log-enabled'

function captureHttp({ headers }, { awsRequestId }, sampleDebugLogRate) {
  if (!headers) {
   Log.warn(`Request ${awsRequestId} is missing headers`)
   return
  }

  let correlationIds = { awsRequestId }
  for (const header in headers) {
    if (header.toLowerCase().startsWith('x-correlation-')) {
      correlationIds[header] = headers[header]
    }
  }
 
  if (!correlationIds[X_CORRELATION_ID]) {
    correlationIds[X_CORRELATION_ID] = awsRequestId
  }

  // forward the original User-Agent on
  if (headers['User-Agent']) {
    correlationIds['User-Agent'] = headers['User-Agent']
  }

  if (headers[DEBUG_LOG_ENABLED]) {
    correlationIds[DEBUG_LOG_ENABLED] = headers[DEBUG_LOG_ENABLED]
  } else {
    correlationIds[DEBUG_LOG_ENABLED] = Math.random() < sampleDebugLogRate ? 'true' : 'false'
  }

  CorrelationIds.replaceAllWith(correlationIds)
}

function captureSns({ Records }, { awsRequestId }, sampleDebugLogRate) {
  let correlationIds = { awsRequestId }

  const snsRecord = Records[0].Sns
  const msgAttributes = snsRecord.MessageAttributes
  
  for (var msgAttribute in msgAttributes) {
    if (msgAttribute.toLowerCase().startsWith('x-correlation-')) {
      correlationIds[msgAttribute] = msgAttributes[msgAttribute].Value
    }

    if (msgAttribute === 'User-Agent') {
      correlationIds['User-Agent'] = msgAttributes['User-Agent'].Value
    }

    if (msgAttribute === DEBUG_LOG_ENABLED) {
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

function captureKinesis({ Records }, context, sampleDebugLogRate) {
  const awsRequestId = context.awsRequestId
  const events = Records
    .map(record => {
      let json = new Buffer(record.kinesis.data, 'base64').toString('utf8')
      const event = JSON.parse(json)

      // the wrapped kinesis client would put the correlation IDs as part of 
      // the payload as a special __context__ property
      let correlationIds = event.__context__ || {}
      correlationIds.awsRequestId = awsRequestId

      delete event.__context__

      if (!correlationIds[X_CORRELATION_ID]) {
        correlationIds[X_CORRELATION_ID] = awsRequestId
      }

      if (!correlationIds[DEBUG_LOG_ENABLED]) {
        correlationIds[DEBUG_LOG_ENABLED] = Math.random() < sampleDebugLogRate ? 'true' : 'false'
      }

      const debugLogEnabled = correlationIds[DEBUG_LOG_ENABLED] === 'true'
      let debugLogRollback = undefined
      let oldCorrelationIds = undefined

      // add functions to the parsed event object to facilitate swapping in & out the current set of
      // correlation IDs since we receive and process records in batch

      // lets you add more correlation IDs for just this record
      event.addToScope = (key, value) => {
        if (!key.startsWith('x-correlation-')) {
          key = 'x-correlation-' + key
        }

        // make sure it's added to the closure so it's retained when we scope and unscope
        correlationIds[key] = value
        CorrelationIds.set(key, value)
      }

      // switches the current correlation IDs to this record
      event.scopeToThis = () => {
        // only do this when the oldCorrelationIds is not assigned, to avoid accidentally overriding
        // when we scopeToThis() twice
        if (!oldCorrelationIds) {
          oldCorrelationIds = CorrelationIds.get()
          CorrelationIds.replaceAllWith(correlationIds)
        }

        if (debugLogEnabled) {
          debugLogRollback = Log.enableDebug()
        }
      }

      // switches the current correlation IDs to what were there previously
      event.unscope = () => {
        if (oldCorrelationIds) {
          CorrelationIds.replaceAllWith(oldCorrelationIds)
        }

        if (debugLogRollback) {
          debugLogRollback()
        }
      }

      return event
    })

  context.parsedKinesisEvents = events

  // although we're going to have per-record correlation IDs, the default one for the function
  // should still have the awsRequestId at least
  CorrelationIds.replaceAllWith({ awsRequestId })
}

function captureContextField({ __context__ }, { awsRequestId }, sampleDebugLogRate) {
  let correlationIds = __context__ || {}
  correlationIds.awsRequestId = awsRequestId
  if (!correlationIds[X_CORRELATION_ID]) {
    correlationIds[X_CORRELATION_ID] = awsRequestId
  }

  if (!correlationIds[DEBUG_LOG_ENABLED]) {
    correlationIds[DEBUG_LOG_ENABLED] = Math.random() < sampleDebugLogRate ? 'true' : 'false'
  }

  CorrelationIds.replaceAllWith(correlationIds)
}

function initCorrelationIds({ awsRequestId }, sampleDebugLogRate) {
  const correlationIds = { awsRequestId }
  correlationIds[X_CORRELATION_ID] = awsRequestId
  correlationIds[DEBUG_LOG_ENABLED] = Math.random() < sampleDebugLogRate ? 'true' : 'false'

  CorrelationIds.replaceAllWith(correlationIds)
}

function isApiGatewayEvent(event) {
  return event.hasOwnProperty('httpMethod')
}

function isSnsEvent(event) {
  if (!event.hasOwnProperty('Records')) {
    return false
  }
  
  if (!Array.isArray(event.Records)) {
    return false
  }

  return event.Records[0].EventSource === 'aws:sns'
}

function isKinesisEvent(event) {
  if (!event.hasOwnProperty('Records')) {
    return false
  }
  
  if (!Array.isArray(event.Records)) {
    return false
  }

  return event.Records[0].eventSource === 'aws:kinesis'
}

function hasContextField(event) {
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