const Log = require('@perform/lambda-powertools-logger')
const apiGateway = require('@perform/lambda-powertools-pattern-basic')

module.exports.handler = apiGateway(async (event, context) => {
  const host = event.headers.Host

  Log.debug(`the current host is: ${host}`)

  return { statusCode: 202 }
})
