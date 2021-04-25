const Log = require('@dazn/lambda-powertools-logger')
const CorrelationIds = require('@dazn/lambda-powertools-correlation-ids')

// config should be { sampleRate: double } where sampleRate is between 0.0-1.0
module.exports = ({ sampleRate }) => {
  const isDebugEnabled = () => {
    const correlationIds = CorrelationIds.get()

    // allow upstream to enable debug logging for the entire call chain
    if (correlationIds['debug-log-enabled'] === 'true') {
      return true
    }

    return sampleRate && Math.random() <= sampleRate
  }

  return {
    before: async (request) => {
      if (isDebugEnabled()) {
        Log.enableDebug()
      }
    },
    after: async (request) => {
      Log.resetLevel()
    },
    onError: async (request) => {
      if (process.env.POWERTOOLS_IGNORE_ERRORS !== 'true') {
        const awsRequestId = request.context
          ? request.context.awsRequestId || ''
          : ''
        const invocationEvent = JSON.stringify(request.event)
        Log.error('invocation failed', { awsRequestId, invocationEvent }, request.error)
      }
    }
  }
}
