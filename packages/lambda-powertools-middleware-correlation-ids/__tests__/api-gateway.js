const _ = require('lodash')
const { standardTests } = require('./lib')

global.console.log = jest.fn()

const apig = require('./event-templates/apig.json')
const genApiGatewayEvent = (correlationIds = {}) => {
  const event = _.cloneDeep(apig)
  event.headers = correlationIds
  return event
}

describe('Correlation IDs middleware (API Gateway)', () => {
  standardTests(genApiGatewayEvent)
})
