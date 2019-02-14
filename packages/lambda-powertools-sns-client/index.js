const AWS = require('aws-sdk')
const client = new AWS.SNS()
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

const originalPublish = client.publish
client.publish = function () {
  const params = arguments[0]
  const newMessageAttributes = addCorrelationIds(params.MessageAttributes)
  arguments[0] = Object.assign({}, params, { MessageAttributes: newMessageAttributes })

  return originalPublish.apply(this, arguments)
}

module.exports = client
