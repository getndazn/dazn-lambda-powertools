const Log = require('@dazn/lambda-powertools-logger')
const apiGateway = require('@dazn/lambda-powertools-pattern-basic')

module.exports.handler = apiGateway(async (event, context) => {
  const host = event.headers.Host

  Log.debug(`the current host is: ${host}`)

  return { statusCode: 202 }
})
