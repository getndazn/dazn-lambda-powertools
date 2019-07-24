const Log = require('@dazn/lambda-powertools-logger')

const getTimer = (event, context, thresholdMillis) => {
  if (typeof context.getRemainingTimeInMillis !== 'function') {
    return null
  }

  const timeLeft = context.getRemainingTimeInMillis()
  const timeoutMs = timeLeft - thresholdMillis
  const timer = setTimeout(() => {
    const awsRequestId = context.awsRequestId
    const invocationEvent = JSON.stringify(event)
    Log.error('invocation timed out', { awsRequestId, invocationEvent })
  }, timeoutMs)

  return timer
}

module.exports = (thresholdMillis = 10) => {
  return {
    before: (handler, next) => {
      const timer = getTimer(handler.event, handler.context, thresholdMillis)
      Object.defineProperty(handler.context, 'lambdaPowertoolsLogTimeoutMiddleware', {
        enumerable: false,
        value: { timer }
      })

      next()
    },
    after: (handler, next) => {
      if (handler.context.lambdaPowertoolsLogTimeoutMiddleware.timer) {
        clearTimeout(handler.context.lambdaPowertoolsLogTimeoutMiddleware.timer)
      }

      next()
    },
    onError: (handler, next) => {
      if (handler.context.lambdaPowertoolsLogTimeoutMiddleware.timer) {
        clearTimeout(handler.context.lambdaPowertoolsLogTimeoutMiddleware.timer)
      }

      next(handler.error)
    }
  }
}
