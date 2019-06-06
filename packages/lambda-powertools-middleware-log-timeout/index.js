const Log = require('@perform/lambda-powertools-logger')

module.exports = (thresholdMillis = 10) => {
  return {
    before: (handler, next) => {
      const timeLeft = handler.context.getRemainingTimeInMillis()
      const timeoutMs = timeLeft - thresholdMillis
      handler.context.logTimeoutTimer = setTimeout(() => {
        const awsRequestId = handler.context.awsRequestId
        const invocationEvent = JSON.stringify(handler.event)
        Log.error('invocation timed out', { awsRequestId, invocationEvent })
      }, timeoutMs)

      next()
    },
    after: (handler, next) => {
      clearTimeout(handler.context.logTimeoutTimer)
      next()
    },
    onError: (handler, next) => {
      clearTimeout(handler.context.logTimeoutTimer)
      next(handler.error)
    }
  }
}
