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

function addCorrelationIds (correlationIds, input) {
  // only do this with JSON string data
  const payload = tryJsonParse(input)
  if (!payload) {
    return input
  }

  const ids = correlationIds.get()
  const newPayload = {
    __context__: ids,
    ...payload
  }
  return JSON.stringify(newPayload)
}

client._startExecution = client.startExecution

client.startExecution = (...args) => {
  return client.startExecutionWithCorrelationIds(CorrelationIds, ...args)
}

client.startExecutionWithCorrelationIds = (correlationIds, params, ...args) => {
  const newInput = addCorrelationIds(correlationIds, params.input)
  const extendedParams = {
    ...params,
    input: newInput
  }

  return client._startExecution(extendedParams, ...args)
}

module.exports = client
