const SNS = require('@dazn/lambda-powertools-sns-client')
const kinesisProcessor = require('@dazn/lambda-powertools-pattern-basic')

module.exports.handler = kinesisProcessor(async (event, context) => {
  const events = context.parsedKinesisEvents

  await Promise.all(events.map(evt => {
    evt.correlationIds.set('sns-sender', 'kinesis')

    // event has a `logger` attached to it, with the specific correlation IDs for that record
    evt.logger.debug('publishing kinesis event as SNS message...', { event: evt })

    const req = {
      Message: JSON.stringify(evt),
      TopicArn: process.env.TOPIC_ARN
    }
    return SNS.publishWithCorrelationIds(evt.correlationIds, req).promise()
  }))
})
