const middy = require('middy')
const sampleLogging = require('@perform/lambda-powertools-middleware-sample-logging')
const captureCorrelationIds = require('@perform/lambda-powertools-middleware-correlation-ids')
const flushMetrics = require('@perform/lambda-powertools-middleware-flush-datadog-metrics')

module.exports = f => {
  return middy(f)
    .use(flushMetrics({ prefix: process.env.AWS_LAMBDA_FUNCTION_NAME }))
    .use(captureCorrelationIds({ sampleDebugLogRate: 0.01 }))
    .use(sampleLogging({ sampleRate: 0.01 }))    
}