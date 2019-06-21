const uuid = require('uuid/v4')
const { invokeHandler } = require('./lib')

global.console.log = jest.fn()

describe('correlation IDs are always initialized', () => {
  describe('when sampleDebugLogRate = 0', () => {
    it('always sets debug-log-enabled to false', () => {
      const requestId = uuid()
      invokeHandler({}, requestId, 0, x => {
        expect(x['awsRequestId']).toBe(requestId)
        expect(x['debug-log-enabled']).toBe('false')
      })
    })
  })

  describe('when sampleDebugLogRate = 1', () => {
    it('always sets debug-log-enabled to true', () => {
      const requestId = uuid()
      invokeHandler({}, requestId, 1, x => {
        expect(x['awsRequestId']).toBe(requestId)
        expect(x['debug-log-enabled']).toBe('true')
      })
    })
  })

  it('always initialises it from the awsRequestId', () => {
    const requestId = uuid()
    invokeHandler({}, requestId, 0, x => {
      expect(x['x-correlation-id']).toBe(requestId)
      expect(x['awsRequestId']).toBe(requestId)
    })
  })
})
