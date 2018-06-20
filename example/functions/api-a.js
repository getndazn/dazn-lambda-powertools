const Log = require('@perform/lambda-powertools-logger')
const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')
const Datadog = require('@perform/dazn-datadog-metrics')
const HTTP = require('@perform/lambda-powertools-http-client')
const Kinesis = require('@perform/lambda-powertools-kinesis-client')
const apiGateway = require('@perform/lambda-powertools-pattern-basic')
const uuid = require('uuid/v4')

module.exports.handler = apiGateway(async (event, context) => {
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

  const putRecordReq = {
    StreamName: 'lambda-powertools-demo',
    PartitionKey: uuid(),
    Data: JSON.stringify({ message: 'hello kinesis' })
  }

  try {
    await Datadog.trackExecTime(
      () => Kinesis.putRecord(putRecordReq).promise(),
      'Kinesis.putRecord'
    )
  } catch (err) {
    Log.error('failed to put record to Kinesis', { putRecordReq }, err)
  }

  return { 
    statusCode: 200, 
    body: JSON.stringify({ message: 'all done' }) 
  }
})