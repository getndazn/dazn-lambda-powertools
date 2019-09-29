const CorrelationIds = require('@dazn/lambda-powertools-correlation-ids')
const Log = require('@dazn/lambda-powertools-logger')

module.exports = (threshold = 10) => {
  return {
    before: (handler, next) => {
      const len = CorrelationIds.get()['call-chain-length'] || 1
      if (len >= threshold) {
        let awsRequestId = handler.context.awsRequestId
        let invocationEvent = JSON.stringify(handler.event)
        Log.error('Possible infinite recursion detected, invocation is stopped.', { awsRequestId, invocationEvent })
        throw new Error(`'call-chain-length' reached threshold of ${threshold}, possible infinite recursion`)
      } else {
        next()
      }
    }
  }
}
