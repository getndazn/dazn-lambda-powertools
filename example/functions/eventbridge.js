const SNS = require('@dazn/lambda-powertools-sns-client')
const wrap = require('@dazn/lambda-powertools-pattern-basic')
const Log = require('@dazn/lambda-powertools-logger')
const CorrelationIds = require('@dazn/lambda-powertools-correlation-ids')

module.exports.handler = wrap(async (event, context) => {
  console.log(JSON.stringify(event))

  CorrelationIds.set('sns-sender', 'eventbridge')
  Log.debug('publishing eventbridge event as SNS message...', { event })

  const req = {
    Message: JSON.stringify(event),
    TopicArn: process.env.TOPIC_ARN
  }
  return SNS.publish(req).promise()
})
