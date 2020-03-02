const DynamoDBProcessor = require('@dazn/lambda-powertools-pattern-basic')
const SNS = require('@dazn/lambda-powertools-sns-client')

const { TOPIC_ARN } = process.env

module.exports.handler = DynamoDBProcessor(async (event, context) => {
  const events = context.parsedDynamoDbEvents

  await Promise.all(events.map(async evt => {
    evt.correlationIds.set('sns-sender', 'dynamodb')

    // event has a `logger` attached to it, with the specific correlation IDs for that record
    evt.logger.debug('publishing DynamoDB event as SNS message...', { event: evt })

    const req = {
      Message: JSON.stringify(evt),
      TopicArn: TOPIC_ARN
    }
    await SNS.publishWithCorrelationIds(evt.correlationIds, req).promise()
  }))
})
