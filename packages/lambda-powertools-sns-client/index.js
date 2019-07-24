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

const client = new AWS.SNS()
const CorrelationIds = require('@dazn/lambda-powertools-correlation-ids')

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

client._publish = client.publish

client.publish = (...args) => {
  return client.publishWithCorrelationIds(CorrelationIds, ...args)
}

client.publishWithCorrelationIds = (correlationIds, params, ...args) => {
  const newMessageAttributes = addCorrelationIds(correlationIds, params.MessageAttributes)
  const extendedParams = {
    ...params,
    MessageAttributes: newMessageAttributes
  }

  return client._publish(extendedParams, ...args)
}

module.exports = client
