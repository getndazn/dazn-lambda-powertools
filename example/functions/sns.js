const Log = require('@perform/lambda-powertools-logger')
const HTTP = require('@perform/lambda-powertools-http-client')
const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')
const snsProcessor = require('@perform/lambda-powertools-pattern-sns')

module.exports.handler = snsProcessor(async (event, context, callback) => {
  CorrelationIds.set('event-source', 'sns')

  const httpRequest = {
    uri: `https://google.com`,
    method: 'get'
  }

  Log.debug('calling google', { httpRequest }) // this is how log with extra context
  await HTTP(httpRequest)
  Log.debug('google is alive (of course it is!)', { httpRequest })

  callback(null)
})