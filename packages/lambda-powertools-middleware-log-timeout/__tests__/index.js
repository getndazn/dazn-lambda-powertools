const consoleLog = jest.spyOn(global.console, 'log')

const middy = require('middy')
const logTimeoutMiddleware = require('../index')

const delay = (millis) => new Promise((resolve) => setTimeout(resolve, millis))

beforeEach(() => {
  consoleLog.mockClear()
})

const invokeSuccessHandler = async () => {
  const handler = middy(async () => {
  })
  handler.use(logTimeoutMiddleware())

  await handler({}, { awsRequestId: 'test-id' }, () => {})
}

const invokeTimedOutHandler = async (event, awsRequestId) => {
  const context = {
    awsRequestId,
    getRemainingTimeInMillis: () => 20
  }

  const handler = middy(async () => {
    await delay(20)
  })
  handler.use(logTimeoutMiddleware())

  await new Promise((resolve) => {
    handler(event, context, resolve)
  })
}

const errorLogWasWritten = (f) => {
  expect(consoleLog).toBeCalled()
  const log = JSON.parse(consoleLog.mock.calls[0])
  expect(log.sLevel).toBe('ERROR')
  expect(log.level).toBe(50)
  expect(log.message).toBe('invocation timed out')

  f(log)
}

describe('Log timeout middleware', () => {
  describe('when function finishes successfully', () => {
    it('does not log anything', async () => {
      await invokeSuccessHandler()
      expect(consoleLog).not.toBeCalled()
    })
  })

  describe('when function times out', () => {
    it('logs an error message', async () => {
      const event = { test: 'wat' }
      const awsRequestId = 'test-id'

      await invokeTimedOutHandler(event, awsRequestId)

      errorLogWasWritten(x => {
        expect(x.awsRequestId).toBe(awsRequestId)
        expect(x.invocationEvent).toBeDefined()
        expect(JSON.parse(x.invocationEvent)).toEqual(event)
      })
    })
  })
})
