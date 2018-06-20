const Log = require('@perform/lambda-powertools-logger')
const SNS = require('@perform/lambda-powertools-sns-client')
const kinesisProcessor = require('@perform/lambda-powertools-pattern-basic')

module.exports.handler = kinesisProcessor(async (event, context) => {
  const events = context.parsedKinesisEvents

  for (const evt of events) {
    evt.scopeToThis() // this is how you scope to an event's correlation IDs

    Log.debug(`publishing kinesis event as SNS message...`, { event: evt })

    const req = {
      Message: JSON.stringify(evt),
      TopicArn: process.env.TOPIC_ARN
    }
    await SNS.publish(req).promise()

    evt.unscope() // and you have to unscope at the end...
  }
})