const middy = require('middy')
const sampleLogging = require('@perform/lambda-powertools-middleware-sample-logging')
const captureCorrelationIds = require('@perform/lambda-powertools-middleware-correlation-ids')

module.exports = f => {
  return middy(f)
    .use(captureCorrelationIds({ sampleDebugLogRate: 0.01 }))
    .use(sampleLogging({ sampleRate: 0.01 }))
}