const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')

const generic = require('./event_sources/generic')
const eventSources = [
  require('./event_sources/api_gateway'),
  require('./event_sources/sns'),
  require('./event_sources/sqs'),
  require('./event_sources/kinesis'),
  require('./event_sources/direct_invoke')
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
