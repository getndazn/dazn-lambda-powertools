const AWS = require('aws-sdk')
const client = new AWS.Lambda()
const Log = require('@perform/lambda-powertools-logger')
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

const originalInvoke = client.invoke
client.invoke = function () {
  const params = arguments[0]
  const newPayload = addCorrelationIds(params.Payload)
  arguments[0] = Object.assign({}, params, { Payload: newPayload })

  return originalInvoke.apply(this, arguments)
}

const originalInvokeAsync = client.invokeAsync
client.invokeAsync = function () {
  const params = arguments[0]
  const newPayload = addCorrelationIds(params.InvokeArgs)
  arguments[0] = Object.assign({}, params, { InvokeArgs: newPayload })

  return originalInvokeAsync.apply(this, arguments)
}

module.exports = client