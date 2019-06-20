const middy = require('middy')
const sampleLogging = require('@perform/lambda-powertools-middleware-sample-logging')
const captureCorrelationIds = require('@perform/lambda-powertools-middleware-correlation-ids')
const logTimeout = require('@perform/lambda-powertools-middleware-log-timeout')

const AWS_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION
const FUNCTION_NAME = process.env.AWS_LAMBDA_FUNCTION_NAME
const FUNCTION_VERSION = process.env.AWS_LAMBDA_FUNCTION_VERSION
const ENV = process.env.ENVIRONMENT || process.env.STAGE

if (!process.env.DATADOG_PREFIX) {
  process.env.DATADOG_PREFIX = FUNCTION_NAME + '.'
}

const supplementCsv = (existing, toAdd) => {
  // existing will be in the format '<key1>:<value1>,<key2>:<value2>'
  // Map requires as [[key1, value1], [key2, value2]]
  const existingNormalised = existing.split(',').map(pair => pair.split(':'))

  // Assigning to a map to stop any duplicates keys (existing taking precedence)
  const allTags = new Map([...toAdd, ...existingNormalised])

  // convert back to original csv format
  return Array.from(allTags).map(i => i.join(':')).join(',')
}

process.env.DATADOG_TAGS = supplementCsv(process.env.DATADOG_TAGS, [
  ['awsRegion', AWS_REGION],
  ['functionName', FUNCTION_NAME],
  ['functionVersion', FUNCTION_VERSION],
  ['environment', ENV]
])

module.exports = f => {
  return middy(f)
    .use(captureCorrelationIds({
      sampleDebugLogRate: parseFloat(process.env.SAMPLE_DEBUG_LOG_RATE || '0.01')
    }))
    .use(sampleLogging({
      sampleRate: parseFloat(process.env.SAMPLE_DEBUG_LOG_RATE || '0.01')
    }))
    .use(logTimeout())
}
