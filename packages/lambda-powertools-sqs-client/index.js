const AWS = require('aws-sdk')
const client = new AWS.SQS()
const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')

function addCorrelationIds (messageAttributes) {
  let attributes = {}
  let correlationIds = CorrelationIds.get()
  for (let key in correlationIds) {
    attributes[key] = {
      DataType: 'String',
      StringValue: correlationIds[key]
    }
  }

  // use `attribtues` as base so if the user's message attributes would override
  // our correlation IDs
  return Object.assign(attributes, messageAttributes || {})
}

const originalSendMessage = client.sendMessage
client.sendMessage = function () {
  const params = arguments[0]
  const newMessageAttributes = addCorrelationIds(params.MessageAttributes)
  arguments[0] = Object.assign({}, params, { MessageAttributes: newMessageAttributes })

  return originalSendMessage.apply(this, arguments)
}

const originalSendMessageBatch = client.sendMessageBatch
client.sendMessageBatch = function () {
  const params = arguments[0]
  const newEntires = params.Entries.map(entry => {
    const newMessageAttributes = addCorrelationIds(entry.MessageAttributes)
    return Object.assign({}, entry, { MessageAttributes: newMessageAttributes })
  })
  arguments[0] = Object.assign({}, params, { Entries: newEntires })

  return originalSendMessageBatch.apply(this, arguments)
}

module.exports = client
