const consoleLog = jest.spyOn(global.console, 'log')

const middy = require('middy')
const logTimeoutMiddleware = require('../index')

jest.useFakeTimers()

beforeEach(() => {
  consoleLog.mockClear()
})

const invokeSuccessHandler = async (threshold) => {
  const middleware = threshold
    ? logTimeoutMiddleware(threshold)
    : logTimeoutMiddleware()

  const handler = middy(async () => {
  })
  handler.use(middleware)

  await handler({}, { awsRequestId: 'test-id' }, () => {})
}

const invokeTimedOutHandler = async (event, awsRequestId, threshold) => {
  const context = {
    awsRequestId,
    getRemainingTimeInMillis: () => 1000
  }

  const middleware = threshold
    ? logTimeoutMiddleware(threshold)
    : logTimeoutMiddleware()

  const elapsedTime = threshold
    ? 1000 - threshold
    : 990 // default threshold is 10ms

  const handler = middy(async () => {
    jest.advanceTimersByTime(elapsedTime)
  })
  handler.use(middleware)

  await handler(event, context, () => {})
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
  describe('default threshold', () => {
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

  describe('custom threshold', () => {
    describe('when function finishes successfully', () => {
      it('does not log anything', async () => {
        await invokeSuccessHandler(150)
        expect(consoleLog).not.toBeCalled()
      })
    })

    describe('when function times out', () => {
      it('logs an error message', async () => {
        const event = { test: 'wat' }
        const awsRequestId = 'test-id'

        await invokeTimedOutHandler(event, awsRequestId, 150)

        errorLogWasWritten(x => {
          expect(x.awsRequestId).toBe(awsRequestId)
          expect(x.invocationEvent).toBeDefined()
          expect(JSON.parse(x.invocationEvent)).toEqual(event)
        })
      })
    })
  })
})
