process.env.AWS_NODEJS_CONNECTION_REUSE_ENABLED = '1'
const Firehose = require('aws-sdk/clients/firehose')
const client = new Firehose()
const Log = require('@dazn/lambda-powertools-logger')
const CorrelationIds = require('@dazn/lambda-powertools-correlation-ids')

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
  const newData = addCorrelationIds(correlationIds, params.Record.Data)
  const extendedParams = {
    ...params,
    Record: {
      Data: newData
    }
  }

  return client._putRecord(extendedParams, ...args)
}

client._putRecordBatch = client.putRecordBatch

client.putRecordBatch = (...args) => {
  return client.putRecordBatchWithCorrelationIds(CorrelationIds, ...args)
}

client.putRecordBatchWithCorrelationIds = (correlationIds, params, ...args) => {
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

  return client._putRecordBatch(extendedParams, ...args)
}

module.exports = client
