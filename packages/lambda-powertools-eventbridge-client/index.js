process.env.AWS_NODEJS_CONNECTION_REUSE_ENABLED = '1'
const EventBridge = require('aws-sdk/clients/eventbridge')
const client = new EventBridge()
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

client._putEvents = client.putEvents

client.putEvents = (...args) => {
  return client.putEventsWithCorrelationIds(CorrelationIds, ...args)
}

client.putEventsWithCorrelationIds = (correlationIds, params, ...args) => {
  const newEntries = params.Entries.map(entry => {
    const newDetail = addCorrelationIds(correlationIds, entry.Detail)
    return {
      ...entry,
      Detail: newDetail
    }
  })

  const extendedParams = {
    ...params,
    Entries: newEntries
  }

  return client._putEvents(extendedParams, ...args)
}

module.exports = client
