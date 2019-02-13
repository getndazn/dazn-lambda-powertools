const AWS = require('aws-sdk')
const client = new AWS.Kinesis()
const Log = require('@perform/lambda-powertools-logger')
const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')

function tryJsonParse (data) {
  if (typeof data !== 'string') {
    return null
  }

  try {
    return JSON.parse(data)
  } catch (err) {
    Log.warn('only JSON string data can be modified to insert correlation IDs', null, err)
    return null
  }
}

function addCorrelationIds (data) {
  // only do this with JSON string data
  const payload = tryJsonParse(data)
  if (!payload) {
    return data
  }

  const correlationIds = CorrelationIds.get()
  const newData = Object.assign({ __context__: correlationIds }, payload)
  return JSON.stringify(newData)
}

const originalPutRecord = client.putRecord
client.putRecord = function () {
  const params = arguments[0]
  const newData = addCorrelationIds(params.Data)
  arguments[0] = Object.assign({}, params, { Data: newData })

  return originalPutRecord.apply(this, arguments)
}

const originalPutRecords = client.putRecords
client.putRecords = function () {
  const params = arguments[0]
  const newRecords = params.Records.map(record => {
    const newData = addCorrelationIds(record.Data)
    return Object.assign({}, record, { Data: newData })
  })
  arguments[0] = Object.assign({}, params, { Records: newRecords })

  return originalPutRecords.apply(this, arguments)
}

module.exports = client
