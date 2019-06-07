const Log = require('@perform/lambda-powertools-logger')

module.exports = (thresholdMillis = 10) => {
  return {
    before: (handler, next) => {
      const timeLeft = handler.context.getRemainingTimeInMillis()
      const timeoutMs = timeLeft - thresholdMillis
      const timer = setTimeout(() => {
        const awsRequestId = handler.context.awsRequestId
        const invocationEvent = JSON.stringify(handler.event)
        Log.error('invocation timed out', { awsRequestId, invocationEvent })
      }, timeoutMs)

      Object.defineProperty(handler.context, 'lambdaPowertoolsLogTimeoutMiddleware', {
        enumerable: false,
        value: { timer }
      });
        timer
      }

      next()
    },
    after: (handler, next) => {
      clearTimeout(handler.context.lambdaPowertoolsLogTimeoutMiddleware.timer)
      next()
    },
    onError: (handler, next) => {
      clearTimeout(handler.context.lambdaPowertoolsLogTimeoutMiddleware.timer)
      next(handler.error)
    }
  }
}
