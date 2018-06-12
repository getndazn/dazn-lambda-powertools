const Log = require('@perform/lambda-powertools-logger')
const apiGateway = require('@perform/lambda-powertools-pattern-api-gateway')

module.exports.handler = apiGateway(async (event, context, callback) => {
  const host = event.headers.Host

  Log.debug(`the current host is: ${host}`)

  callback(null, { statusCode: 202 })
})