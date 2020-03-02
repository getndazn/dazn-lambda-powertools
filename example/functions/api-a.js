const Log = require('@dazn/lambda-powertools-logger')
const CorrelationIds = require('@dazn/lambda-powertools-correlation-ids')
const Datadog = require('@dazn/datadog-metrics')
const HTTP = require('@dazn/lambda-powertools-http-client')
const Kinesis = require('@dazn/lambda-powertools-kinesis-client')
const Firehose = require('@dazn/lambda-powertools-firehose-client')
const EventBridge = require('@dazn/lambda-powertools-eventbridge-client')
const CloudWatchEvents = require('@dazn/lambda-powertools-cloudwatchevents-client')
const wrap = require('@dazn/lambda-powertools-pattern-basic')
const uuid = require('uuid/v4')

const { FIREHOSE_STREAM, KINESIS_STREAM } = process.env

module.exports.handler = wrap(async (event, context) => {
  Datadog.gauge('api-a', 1)
  const host = event.headers.Host

  Log.debug(`the current host is: ${host}`)
  const userId = uuid()
  // this is how you add new correlation IDs
  CorrelationIds.set('user-id', userId)

  const httpRequest = {
    uri: `https://${host}/dev`,
    method: 'post',
    body: { message: 'hello world' }
  }

  try {
    Log.debug('calling api-b', { httpRequest }) // this is how log with extra context
    await HTTP(httpRequest)
  } catch (err) {
    Log.error('api-b errored', { httpRequest }, err) // WARN and ERROR logs lets you log with an error object too
  }

  try {
    await Datadog.trackExecTime(
      () => Kinesis.putRecord({
        StreamName: KINESIS_STREAM,
        PartitionKey: uuid(),
        Data: JSON.stringify({ message: 'hello kinesis' })
      }).promise(),
      'Kinesis.putRecord'
    )
  } catch (err) {
    Log.error('failed to put record to Kinesis', { streamName: KINESIS_STREAM }, err)
  }

  try {
    await Datadog.trackExecTime(
      () => Firehose.putRecord({
        DeliveryStreamName: FIREHOSE_STREAM,
        Record: {
          Data: JSON.stringify({ message: 'hello firehose' })
        }
      }).promise(),
      'Firehose.putRecord'
    )
  } catch (err) {
    Log.error('failed to put record to Firehose', { streamName: FIREHOSE_STREAM }, err)
  }

  try {
    await Datadog.trackExecTime(
      () => EventBridge.putEvents({
        Entries: [{
          Source: 'dazn-lambda-powertools-example',
          'Detail-Type': 'eventbridge',
          Detail: JSON.stringify({ message: 'hello eventbridge' })
        }]
      }).promise(),
      'EventBridge.putEvents'
    )
  } catch (err) {
    Log.error('failed to put events to EventBridge', err)
  }

  try {
    await Datadog.trackExecTime(
      () => CloudWatchEvents.putEvents({
        Entries: [{
          Source: 'dazn-lambda-powertools-example',
          'Detail-Type': 'cloudwatchevents',
          Detail: JSON.stringify({ message: 'hello cloudwatchevents' })
        }]
      }).promise(),
      'CloudWatchEvents.putEvents'
    )
  } catch (err) {
    Log.error('failed to put events to CloudWatchEvents', err)
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'all done' })
  }
})
