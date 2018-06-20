const Log = require('@perform/lambda-powertools-logger')
const Metrics = require('datadog-metrics')

const AWS_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION
const FUNCTION_NAME = process.env.AWS_LAMBDA_FUNCTION_NAME
const FUNCTION_VERSION = process.env.AWS_LAMBDA_FUNCTION_VERSION
const ENV = process.env.ENVIRONMENT || process.env.STAGE

process.env.DATADOG_TAGS = `awsRegion:${AWS_REGION},functionName:${FUNCTION_NAME},functionVersion:${FUNCTION_VERSION},environment:${ENV}`

Log.debug('default metrics tags', { tags: process.env.DATADOG_TAGS })

module.exports = () => {
  return {
    before: (handler, next) => {      
      next()
    },
    after: async (handler, next) => {
      await flush()
      next()
    },
    onError: async (handler, next) => {
      await flush()
      next(handler.error)
    }
  }
}