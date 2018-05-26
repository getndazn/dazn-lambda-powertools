const Log = require('@perform/lambda-powertools-logger')
const Metrics = require('datadog-metrics')
const Env = process.env.ENVIRONMENT || process.env.STAGE

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
        defaultTags: [`environment:${Env}`],
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