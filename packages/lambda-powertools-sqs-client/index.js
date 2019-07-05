const AWS = require('aws-sdk')
const https = require('https')
const sslAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  rejectUnauthorized: true
})
sslAgent.setMaxListeners(0)

AWS.config.update({
  httpOptions: {
    agent: sslAgent
  }
})

const client = new AWS.SQS()
const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')

function addCorrelationIds (correlationIds, messageAttributes) {
  const attributes = {}
  const ids = correlationIds.get()
  for (const key in ids) {
    attributes[key] = {
      DataType: 'String',
      StringValue: `${ids[key]}`
    }
  }

  // use `attributes` as base so if the user's message attributes would override
  // our correlation IDs
  return Object.assign(attributes, messageAttributes || {})
}

client._sendMessage = client.sendMessage

client.sendMessage = (...args) => {
  return client.sendMessageWithCorrelationIds(CorrelationIds, ...args)
}

client.sendMessageWithCorrelationIds = (correlationIds, params, ...args) => {
  const newMessageAttributes = addCorrelationIds(correlationIds, params.MessageAttributes)
  const extendedParams = {
    ...params,
    MessageAttributes: newMessageAttributes
  }

  return client._sendMessage(extendedParams, ...args)
}

client._sendMessageBatch = client.sendMessageBatch

client.sendMessageBatch = (...args) => {
  return client.sendMessageBatchWithCorrelationIds(CorrelationIds, ...args)
}

client.sendMessageBatchWithCorrelationIds = (correlationIds, params, ...args) => {
  const newEntries = params.Entries.map(entry => {
    const newMessageAttributes = addCorrelationIds(correlationIds, entry.MessageAttributes)
    return {
      ...entry,
      MessageAttributes: newMessageAttributes
    }
  })

  const extendedParams = {
    ...params,
    Entries: newEntries
  }

  return client._sendMessageBatch(extendedParams, ...args)
}

module.exports = client
