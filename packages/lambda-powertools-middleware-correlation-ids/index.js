const CorrelationIds = require('@dazn/lambda-powertools-correlation-ids')

const generic = require('./event-sources/generic')
const eventSources = [
  require('./event-sources/api-gateway'),
  require('./event-sources/sns'),
  require('./event-sources/sqs'),
  require('./event-sources/kinesis'),
  require('./event-sources/direct-invoke')
]

module.exports = ({ sampleDebugLogRate }) => {
  return {
    before: (handler, next) => {
      CorrelationIds.clearAll()

      const { event, context } = handler
      const eventSource = eventSources.find(evtSrc => evtSrc.isMatch(event))
      if (eventSource) {
        eventSource.captureCorrelationIds(event, context, sampleDebugLogRate)
      } else {
        generic.captureCorrelationIds(event, context, sampleDebugLogRate)
      }

      next()
    }
  }
}
