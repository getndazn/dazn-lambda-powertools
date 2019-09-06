const SNS = require('@dazn/lambda-powertools-sns-client')
const firehoseProcessor = require('@dazn/lambda-powertools-pattern-basic')

module.exports.handler = firehoseProcessor(async (event, context) => {
  console.log(JSON.stringify(event))

  const events = context.parsedFirehoseEvents

  await Promise.all(events.map(evt => {
    evt.correlationIds.set('sns-sender', 'firehose')

    // event has a `logger` attached to it, with the specific correlation IDs for that record
    evt.logger.debug('publishing firehose event as SNS message...', { event: evt })

    const req = {
      Message: JSON.stringify(evt),
      TopicArn: process.env.TOPIC_ARN
    }
    return SNS.publishWithCorrelationIds(evt.correlationIds, req).promise()
  }))
})
