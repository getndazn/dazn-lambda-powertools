const AWS            = require('aws-sdk')
const Lambda         = new AWS.Lambda()
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

function invoke(params, cb) {
  const newPayload = addCorrelationIds(params.Payload)
  const newParams = Object.assign({}, params, { Payload: newPayload })

  return Lambda.invoke(newParams, cb)
}

function invokeAsync(params, cb) {
  const newPayload = addCorrelationIds(params.InvokeArgs)
  const newParams = Object.assign({}, params, { InvokeArgs: newPayload })

  return Lambda.invokeAsync(newParams, cb)
}

const client = Object.assign({}, Lambda, { invoke, invokeAsync })

module.exports = client