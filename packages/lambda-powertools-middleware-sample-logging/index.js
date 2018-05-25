const Log = require('@perform/lambda-powertools-logger')

// config should be { sampleRate: double } where sampleRate is between 0.0-1.0
module.exports = ({ sampleRate }) => {
  let oldLogLevel = undefined

  return {
    before: (handler, next) => {
      if (sampleRate && Math.random() <= sampleRate) {
        oldLogLevel = process.env.log_level
        process.env.log_level = 'DEBUG'
      }

      next()
    },
    after: (handler, next) => {
      if (oldLogLevel) {
        process.env.log_level = oldLogLevel
      }

      next()
    },
    onError: (handler, next) => {
      let awsRequestId = handler.context.awsRequestId
      let invocationEvent = JSON.stringify(handler.event)
      Log.error('invocation failed', { awsRequestId, invocationEvent }, handler.error)
      
      next(handler.error)
    }
  }
}