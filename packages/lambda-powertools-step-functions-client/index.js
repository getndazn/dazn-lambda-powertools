const AWS            = require('aws-sdk')
const SFN            = new AWS.StepFunctions()
const Log            = require('@perform/lambda-powertools-logger')
const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')

function tryJsonParse(input) {
  if (typeof input !== 'string') {
    return null
  }

  try {
    return JSON.parse(input)
  } catch (err) {
    Log.warn('only JSON string data can be modified to insert correlation IDs', null, err)
    return null
  }
}

function addCorrelationIds(input) {
  // only do this with JSON string data
  const payload = tryJsonParse(input)
  if (!payload) {
    return input
  }

  const correlationIds = CorrelationIds.get()
  const newPayload = Object.assign({ __context__: correlationIds }, payload)
  return JSON.stringify(newPayload)
}

function startExecution(params, cb) {
  const newInput = addCorrelationIds(params.input)
  const newParams = Object.assign({}, params, { input: newInput })

  return SFN.startExecution(newParams, cb)
}

const client = Object.assign({}, SFN, { startExecution })

module.exports = client