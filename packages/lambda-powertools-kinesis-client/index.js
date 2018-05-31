const AWS            = require('aws-sdk')
const Kinesis        = new AWS.Kinesis()
const Log            = require('@perform/lambda-powertools-logger')
const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')

function tryJsonParse(data) {
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

function addCorrelationIds(data) {
  // only do with with JSON string data
  const payload = tryJsonParse(data)
  if (!payload) {
    return data
  }

  const correlationIds = CorrelationIds.get()
  const newData = Object.assign({ __context__: correlationIds }, payload)
  return JSON.stringify(newData)
}

function putRecord(params, cb) {
  const newData = addCorrelationIds(params.Data)
  params = Object.assign({}, params, { Data: newData })

  return Kinesis.putRecord(params, cb)
}

function putRecords(params, cb) {
  const newRecords = params.Records.map(record => {
    const newData = addCorrelationIds(record.Data)
    return Object.assign({}, record, { Data: newData })
  })

  return Kinesis.putRecords(params, cb)
}

const client = Object.assign({}, Kinesis, { putRecord, putRecords })

module.exports = client