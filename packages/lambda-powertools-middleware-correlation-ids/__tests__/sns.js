const _ = require('lodash')
const { standardTests } = require('./lib')

global.console.log = jest.fn()

const sns = require('./event_templates/sns.json')
const genSnsEvent = (correlationIDs = {}) => {
  const event = _.cloneDeep(sns)
  const messageAttributes = _.mapValues(correlationIDs, value => ({
    Type: 'String',
    Value: value
  }))

  Object.assign(event.Records[0].Sns.MessageAttributes, messageAttributes)

  return event
}

describe('Correlation IDs middleware (SNS)', () => {
  standardTests(genSnsEvent)
})
