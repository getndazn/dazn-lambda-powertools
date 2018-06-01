const Log = require('@perform/lambda-powertools-logger')
const Metrics = require('datadog-metrics')

const AWS_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION
const FUNCTION_NAME = process.env.AWS_LAMBDA_FUNCTION_NAME
const FUNCTION_VERSION = process.env.AWS_LAMBDA_FUNCTION_VERSION
const ENV = process.env.ENVIRONMENT || process.env.STAGE

const DEFAULT_TAGS = [
  `awsRegion:${AWS_REGION}`,
  `functionName:${FUNCTION_NAME}`,
  `functionVersion:${FUNCTION_VERSION}`,
  `environment:${ENV}`
]

const flush = () => new Promise((resolve, reject) => {
  Metrics.flush(
    () => {
      Log.debug('datadog metrics flushed')
      resolve()
    },
    (err) => {
      Log.error('datadog metrics could not be flushed', {}, err)
      resolve()
    }
  )
})

module.exports = ({ prefix }) => {
  return {
    before: (handler, next) => {
      Metrics.init({
        apiKey: process.env.DATADOG_API_KEY,
        prefix: prefix,
        defaultTags: DEFAULT_TAGS,
        flushIntervalSeconds: 0
      })

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