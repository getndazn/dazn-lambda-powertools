const Log = require('@perform/lambda-powertools-logger')
const wrap = require('@perform/lambda-powertools-pattern-basic')

module.exports.handler = wrap(async ({ z }, context) => {
  Log.debug(`doubling ${z}`)
  return z * 2
})