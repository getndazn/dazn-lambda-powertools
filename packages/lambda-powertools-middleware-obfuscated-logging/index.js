const Log = require('@perform/lambda-powertools-logger')
const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')
const obfuscateFields = require ('./obfuscate')

// config should be { sampleRate: double } where sampleRate is between 0.0-1.0
module.exports = ({ sampleRate, obfuscationFilters }) => {
  let rollback = undefined


  const isDebugEnabled = () => {
    const correlationIds = CorrelationIds.get()

    // allow upstream to enable debug logging for the entire call chain
    if (correlationIds['debug-log-enabled'] === 'true') {
      return true
    }

    return sampleRate && Math.random() <= sampleRate
  }

  return {
    before: (handler, next) => {
      rollback = undefined
      
      if (isDebugEnabled()) {
        rollback = Log.enableDebug()
      }

      next()
    },
    after: (handler, next) => {
      if (rollback) {
        rollback()
      }

      next()
    },
    onError: (handler, next) => {
      const awsRequestId = handler.context.awsRequestId
      const obfuscatedEvent = obfuscateFields(handler.event, obfuscationFilters)
      const invocationEvent = JSON.stringify(obfuscatedEvent)
      console.log("InvocationEvent", invocationEvent)
      Log.error('invocation failed', { awsRequestId, invocationEvent }, handler.error)
      
      next(handler.error)
    }
  }
}