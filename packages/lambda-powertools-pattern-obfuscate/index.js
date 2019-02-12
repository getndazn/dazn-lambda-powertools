const middy = require('middy')
const sampleLogging = require('@perform/lambda-powertools-middleware-sample-logging')
const obfuscater = require('@perform/lambda-powertools-middleware-obfuscater')
const captureCorrelationIds = require('@perform/lambda-powertools-middleware-correlation-ids')

const AWS_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION
const FUNCTION_NAME = process.env.AWS_LAMBDA_FUNCTION_NAME
const FUNCTION_VERSION = process.env.AWS_LAMBDA_FUNCTION_VERSION
const ENV = process.env.ENVIRONMENT || process.env.STAGE

if (!process.env.DATADOG_PREFIX) {
  process.env.DATADOG_PREFIX = FUNCTION_NAME + '.'
}

process.env.DATADOG_TAGS = `awsRegion:${AWS_REGION},functionName:${FUNCTION_NAME},functionVersion:${FUNCTION_VERSION},environment:${ENV}`

module.exports = obfuscationFilters => f => {
  return middy(f)
    .use(captureCorrelationIds({ sampleDebugLogRate: 0.01 }))
    .use(obfuscater({obfuscationFilters}))
    .use(sampleLogging({ sampleRate: 0.01, obfuscationFilters }))
}