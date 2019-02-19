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

module.exports = (obfuscationFilters, f, filterOnAfter = false) => {
  return middy(f)
    .use(captureCorrelationIds({ sampleDebugLogRate: 0.01 }))
    // Ensure that the error part of the code is executed last as middy runs before1 > before2 > before3 > after 3 > after 2 > after 1
    // but runs errors error1 > error2 > error 3.
    .use(obfuscater({ obfuscationFilters, filterOnAfter: false }))
    .use(sampleLogging({ sampleRate: 0.01, obfuscationFilters }))
    .use(obfuscater({ obfuscationFilters, filterOnAfter }))
}
