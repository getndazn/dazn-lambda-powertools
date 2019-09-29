const dynamo = require('aws-sdk/clients/dynamodb')
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

  return event.Records[0].eventSource === 'aws:dynamodb'
}

function captureCorrelationIds ({ Records }, context, sampleDebugLogRate) {
  const awsRequestId = context.awsRequestId
  const events = Records
    .map(record => {
      const event = record

      // the wrapped dynamodb client would put the correlation IDs as part of
      // the row item as a special __context__ property

      let correlationIds = {}

      if (event.dynamodb.hasOwnProperty('NewImage') &&
        event.dynamodb.NewImage.hasOwnProperty('__context__')) {
        const unmarshalledRecord = dynamo.Converter.unmarshall(
          event.dynamodb.NewImage
        )
        correlationIds = unmarshalledRecord.__context__

        delete event.dynamodb.NewImage.__context__
      }

      // delete __context__ from old image if any as its no longer relevant
      if (event.dynamodb.hasOwnProperty('OldImage') &&
        event.dynamodb.hasOwnProperty('NewImage') &&
        event.dynamodb.NewImage.hasOwnProperty('__context__')) {
        delete event.dynamodb.OldImage.__context__
      }

      correlationIds.awsRequestId = awsRequestId

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
    })

  context.parsedDynamoDbEvents = events

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
