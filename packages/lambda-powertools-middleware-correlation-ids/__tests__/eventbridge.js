const _ = require('lodash')
const { standardTests } = require('./lib')

global.console.log = jest.fn()

const eventbridge = require('./event-templates/eventbridge.json')
const genEventBridgeEvent = (correlationIDs = {}) => {
  const event = _.cloneDeep(eventbridge)
  event.detail['__context__'] = correlationIDs

  return event
}

describe('Correlation IDs middleware (EventBridge)', () => {
  standardTests(genEventBridgeEvent)
})
