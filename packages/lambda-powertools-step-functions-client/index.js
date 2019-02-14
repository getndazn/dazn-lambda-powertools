const AWS = require('aws-sdk')
const client = new AWS.StepFunctions()
const Log = require('@perform/lambda-powertools-logger')
const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')

function tryJsonParse (input) {
  try {
    return JSON.parse(input)
  } catch (err) {
    Log.warn('only JSON string data can be modified to insert correlation IDs', null, err)
    return null
  }
}

function addCorrelationIds (input) {
  // only do this with JSON string data
  const payload = tryJsonParse(input)
  if (!payload) {
    return input
  }

  const correlationIds = CorrelationIds.get()
  const newPayload = Object.assign({ __context__: correlationIds }, payload)
  return JSON.stringify(newPayload)
}

var originalStartExecution = client.startExecution
client.startExecution = function () {
  const params = arguments[0]
  const newInput = addCorrelationIds(params.input)
  arguments[0] = Object.assign({}, params, { input: newInput })

  return originalStartExecution.apply(this, arguments)
}

module.exports = client
