const middy = require('middy')
const sampleLogging = require('@perform/lambda-powertools-middleware-sample-logging')
const { obfuscaterMiddleware, FILTERING_MODE: obfuscaterFilteringMode } = require('@perform/lambda-powertools-middleware-obfuscater')
const captureCorrelationIds = require('@perform/lambda-powertools-middleware-correlation-ids')

const AWS_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION
const FUNCTION_NAME = process.env.AWS_LAMBDA_FUNCTION_NAME
const FUNCTION_VERSION = process.env.AWS_LAMBDA_FUNCTION_VERSION
const ENV = process.env.ENVIRONMENT || process.env.STAGE

/**
 * Filtering modes this library supports. 
 */
const FILTERING_MODE = Object.freeze({ "BLACKLIST": "BLACKLIST", "WHITELIST": "WHITELIST" })

if (!process.env.DATADOG_PREFIX) {
  process.env.DATADOG_PREFIX = FUNCTION_NAME + '.'
}

process.env.DATADOG_TAGS = `awsRegion:${AWS_REGION},functionName:${FUNCTION_NAME},functionVersion:${FUNCTION_VERSION},environment:${ENV}`

const toObfuscaterFilteringMode = (mode) => {
  if (FILTERING_MODE.BLACKLIST === mode) {
    return obfuscaterFilteringMode.BLACKLIST
  }
  if (FILTERING_MODE.WHITELIST === mode) {
    return obfuscaterFilteringMode.WHITELIST
  }
  return null
}

const errorObfuscater = (obfuscationFilters, filteringMode) => obfuscaterMiddleware({
  filters: obfuscationFilters,
  filteringMode: toObfuscaterFilteringMode(filteringMode),
  filterOnBefore: false,
  filterOnAfter: false,
  filterOnError: true,
})

const genericObfuscater = (obfuscationFilters, filteringMode, filterOnAfter) => obfuscaterMiddleware({
  filters: obfuscationFilters,
  filteringMode: toObfuscaterFilteringMode(filteringMode),
  filterOnBefore: false,
  filterOnAfter: filterOnAfter,
  filterOnError: false,
})

const obfuscaterPattern = (obfuscationFilters, f, filterOnAfter = false, filteringMode = FILTERING_MODE.BLACKLIST) => {
  return middy(f)
    .use(captureCorrelationIds({ sampleDebugLogRate: 0.01 }))
    // Ensure that the error part of the code is executed last as middy runs before1 > before2 > before3 > after 3 > after 2 > after 1
    // but runs errors error1 > error2 > error 3.
    .use(errorObfuscater(obfuscationFilters, filteringMode))
    .use(sampleLogging({ sampleRate: 0.01, obfuscationFilters }))
    .use(genericObfuscater(obfuscationFilters, filteringMode, filterOnAfter))
}

module.export = {
  FILTERING_MODE,
  obfuscaterPattern
}


