const CorrelationIds = require('@dazn/lambda-powertools-correlation-ids')
const Log = require('@dazn/lambda-powertools-logger')
const consts = require('../consts')

function isMatch (event) {
  if (!event.hasOwnProperty('Records')) {
    return false
  }

  if (!Array.isArray(event.Records)) {
    return false
  }

  return event.Records[0].eventSource === 'aws:kinesis'
}

function captureCorrelationIds ({ Records }, context, sampleDebugLogRate) {
  const awsRequestId = context.awsRequestId
  const events = Records
    .map(record => {
      const json = Buffer.from(record.kinesis.data, 'base64').toString('utf8')
      try {
        const event = JSON.parse(json)

        // the wrapped kinesis client would put the correlation IDs as part of
        // the payload as a special __context__ property
        const correlationIds = event.__context__ || {}
        correlationIds.awsRequestId = awsRequestId

        delete event.__context__

        if (!correlationIds[consts.X_CORRELATION_ID]) {
          correlationIds[consts.X_CORRELATION_ID] = awsRequestId
        }

        if (!correlationIds[consts.DEBUG_LOG_ENABLED]) {
          correlationIds[consts.DEBUG_LOG_ENABLED] = Math.random() < sampleDebugLogRate ? 'true' : 'false'
        }

        correlationIds[consts.CALL_CHAIN_LENGTH] = (correlationIds[consts.CALL_CHAIN_LENGTH] || 0) + 1

        const correlationIdsInstance = new CorrelationIds(correlationIds)

        Object.defineProperties(event, {
          correlationIds: {
            value: correlationIdsInstance,
            enumerable: false
          },
          logger: {
            value: new Log({ correlationIds: correlationIdsInstance }),
            enumerable: false
          }
        })

        return event
      } catch (e) {
        Log.warn(`unable to parse Kinesis record`, { kinesisRecord: record })
        // TODO: is this really the best we can do? maybe we need to record these failed
        // records somewhere else, maybe in a failedKinesisEvents array on the context?
        return undefined
      }
    })

  context.parsedKinesisEvents = events

  // although we're going to have per-record correlation IDs, the default one for the function
  // should still have the awsRequestId at least
  CorrelationIds.replaceAllWith({
    'x-correlation-id': awsRequestId,
    awsRequestId,
    [consts.DEBUG_LOG_ENABLED]: Math.random() < sampleDebugLogRate ? 'true' : 'false'
  })
}

module.exports = {
  isMatch,
  captureCorrelationIds
}
