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

function addCorrelationIds (correlationIds, data) {
  // only do this with JSON string data
  const payload = tryJsonParse(data)
  if (!payload) {
    return data
  }

  const ids = correlationIds.get()
  const newData = {
    __context__: ids,
    ...payload
  }
  return JSON.stringify(newData)
}

client._putRecord = client.putRecord

client.putRecord = (...args) => {
  return client.putRecordWithCorrelationIds(CorrelationIds, ...args)
}

client.putRecordWithCorrelationIds = (correlationIds, params, ...args) => {
  const newData = addCorrelationIds(correlationIds, params.Data)
  const extendedParams = {
    ...params,
    Data: newData
  }

  return client._putRecord(extendedParams, ...args)
}

client._putRecords = client.putRecords

client.putRecords = (...args) => {
  return client.putRecordsWithCorrelationIds(CorrelationIds, ...args)
}

client.putRecordsWithCorrelationIds = (correlationIds, params, ...args) => {
  const newRecords = params.Records.map(record => {
    const newData = addCorrelationIds(correlationIds, record.Data)
    return {
      ...record,
      Data: newData
    }
  })

  const extendedParams = {
    ...params,
    Records: newRecords
  }

  return client._putRecords(extendedParams, ...args)
}

module.exports = client
