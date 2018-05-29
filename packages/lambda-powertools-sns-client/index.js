const AWS = require('aws-sdk')
const SNS = new AWS.SNS()
const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')

function addCorrelationIds(messageAttributes) {
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

function publish(params, cb) {
  const newMessageAttributes = addCorrelationIds(params.MessageAttributes)
  params = Object.assign(params, { MessageAttributes: newMessageAttributes })

  return SNS.publish(params, cb)
}

const client = Object.assign({}, SNS, { publish })

module.exports = client