const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')
const Log = require('@perform/lambda-powertools-logger')

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
 
  if (!correlationIds['x-correlation-id']) {
    correlationIds['x-correlation-id'] = awsRequestId
  }

  // forward the original User-Agent on
  if (headers['User-Agent']) {
    correlationIds['User-Agent'] = headers['User-Agent']
  }

  if (headers['Debug-Log-Enabled']) {
    correlationIds['Debug-Log-Enabled'] = headers['Debug-Log-Enabled']
  } else {
    correlationIds['Debug-Log-Enabled'] = Math.random() < sampleDebugLogRate ? 'true' : 'false'
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

    if (msgAttribute === 'Debug-Log-Enabled') {
      correlationIds['Debug-Log-Enabled'] = msgAttributes['Debug-Log-Enabled'].Value
    }
  }
 
  if (!correlationIds['x-correlation-id']) {
    correlationIds['x-correlation-id'] = awsRequestId
  }

  if (!correlationIds['Debug-Log-Enabled']) {
    correlationIds['Debug-Log-Enabled'] = Math.random() < sampleDebugLogRate ? 'true' : 'false'
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

      if (!correlationIds['x-correlation-id']) {
        correlationIds['x-correlation-id'] = awsRequestId
      }

      if (!correlationIds['Debug-Log-Enabled']) {
        correlationIds['Debug-Log-Enabled'] = Math.random() < sampleDebugLogRate ? 'true' : 'false'
      }

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
      };

      // switches the current correlation IDs to what were there previously
      event.unscope = () => {
        if (oldCorrelationIds) {
          CorrelationIds.replaceAllWith(oldCorrelationIds)
        }
      }

      return event
    })

  context.parsedKinesisEvents = events

  // although we're going to have per-record correlation IDs, the default one for the function
  // should still have the awsRequestId at least
  CorrelationIds.replaceAllWith({ awsRequestId })
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
    return false;
  }
  
  if (!Array.isArray(event.Records)) {
    return false;
  }

  return event.Records[0].eventSource === 'aws:kinesis'
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
      }
      
      next()
    }
  }
}