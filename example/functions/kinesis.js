const SNS = require('@dazn/lambda-powertools-sns-client')
const DynamoDB = require('@dazn/lambda-powertools-dynamodb-client')
const kinesisProcessor = require('@dazn/lambda-powertools-pattern-basic')
const uuid = require('uuid/v4')

const { TOPIC_ARN, TABLE_NAME } = process.env

module.exports.handler = kinesisProcessor(async (event, context) => {
  const events = context.parsedKinesisEvents

  await Promise.all(events.map(async evt => {
    evt.correlationIds.set('sns-sender', 'kinesis')

    // event has a `logger` attached to it, with the specific correlation IDs for that record
    evt.logger.debug('publishing kinesis event as SNS message...', { event: evt })

    const req = {
      Message: JSON.stringify(evt),
      TopicArn: TOPIC_ARN
    }
    await SNS.publishWithCorrelationIds(evt.correlationIds, req).promise()

    await DynamoDB.putWithCorrelationIds(evt.correlationIds, {
      TableName: TABLE_NAME,
      Item: { Id: uuid() }
    }).promise()
  }))
})
