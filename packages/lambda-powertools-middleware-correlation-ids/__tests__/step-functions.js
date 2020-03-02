const _ = require('lodash')
const { standardTests } = require('./lib')

global.console.log = jest.fn()

const sfn = require('./event-templates/sfn.json')
const genSfnEvent = (correlationIDs = {}) => {
  const event = _.cloneDeep(sfn)
  event.__context__ = correlationIDs
  return event
}

describe('Correlation IDs middleware (Step Functions)', () => {
  standardTests(genSfnEvent)
})
