const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')
const Log = require('@perform/lambda-powertools-logger')

function captureHttp({ headers }, { awsRequestId }) {
  if (!headers) {
   Log.warn(`Request ${awsRequestId} is missing headers`)
   return
  }

  let correlationIds = { awsRequestId }
  for (const header in headers) {
    if (header.toLowerCase().startsWith("x-correlation-")) {
      correlationIds[header] = headers[header]
    }
  }
 
  if (!correlationIds["x-correlation-id"]) {
    correlationIds["x-correlation-id"] = correlationIds.awsRequestId
  }

  // forward the original User-Agent on
  if (headers["User-Agent"]) {
    correlationIds["User-Agent"] = headers["User-Agent"]
  }


  if (headers["Debug-Log-Enabled"] === 'true') {
    correlationIds["Debug-Log-Enabled"] = "true"
  } else {
    // enable debug logging on 1% of cases
    correlationIds["Debug-Log-Enabled"] = Math.random() < 0.01 ? "true" : "false"
  }

  CorrelationIds.replaceAllWith(correlationIds)
}

function captureSns({ Records }, { awsRequestId }) {
  let correlationIds = { awsRequestId }

  let snsRecord = Records[0].Sns
  let msgAttributes = snsRecord.MessageAttributes
  
  for (var msgAttribute in msgAttributes) {
    if (msgAttribute.toLowerCase().startsWith("x-correlation-")) {
      correlationIds[msgAttribute] = msgAttributes[msgAttribute].Value
    }

    if (msgAttribute === "User-Agent") {
      correlationIds["User-Agent"] = msgAttributes["User-Agent"].Value
    }

    if (msgAttribute === "Debug-Log-Enabled") {
      correlationIds["Debug-Log-Enabled"] = msgAttributes["Debug-Log-Enabled"].Value
    }
  }
 
  if (!correlationIds["x-correlation-id"]) {
    correlationIds["x-correlation-id"] = correlationIds.awsRequestId
  }

  if (!correlationIds["Debug-Log-Enabled"]) {
    // enable debug logging on 1% of cases
    correlationIds["Debug-Log-Enabled"] = Math.random() < 0.01 ? "true" : "false"
  }

  reqContext.replaceAllWith(correlationIds)
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

module.exports = ({ sampleDebugLogRate }) => {
  return {
    before: (handler, next) => {      
      CorrelationIds.clearAll()
      const { event, context } = handler      

      if (isApiGatewayEvent(event)) {
        captureHttp(event, context)
      } else if (isSnsEvent(event)) {
        captureSns(event, context)
      }
      
      next()
    }
  }
}