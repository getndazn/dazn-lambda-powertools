const consoleLog = jest.fn()
global.console.debug = consoleLog
global.console.info = consoleLog
global.console.warn = consoleLog
global.console.error = consoleLog

const middy = require('middy')
const logTimeoutMiddleware = require('../index')
const util = require('util')

jest.useFakeTimers()

beforeEach(() => {
  consoleLog.mockClear()
})

const invokeSuccessHandler = async (threshold) => {
  const context = {
    awsRequestId: 'test-id',
    getRemainingTimeInMillis: () => 1000
  }

  const middleware = threshold
    ? logTimeoutMiddleware(threshold)
    : logTimeoutMiddleware()

  const handler = util.promisify(
    middy(async () => {}).use(middleware)
  )

  await handler({}, context)
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

  const handler = util.promisify(
    middy(async () => {
      jest.advanceTimersByTime(elapsedTime)
    }).use(middleware)
  )

  await handler(event, context)
}

const invokeEmptyContextHandler = async () => {
  const handler = util.promisify(
    middy(async () => {}).use(logTimeoutMiddleware())
  )

  await handler({}, {})
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

  describe('if context does not define a getRemainingTimeInMillis method', () => {
    it('should skip', async () => {
      await invokeEmptyContextHandler()
      expect(consoleLog).not.toBeCalled()
    })
  })

  describe('if another middle errors in the before step', () => {
    it('should not error (issue #82)', async () => {
      const throwOnBefore = {
        before: (handler, next) => {
          throw new Error('boom')
        },
        onError: (handler, next) => {
          expect(handler.error.message).toBe('boom')
          next()
        }
      }

      // when executing on the before stage, it goes throwOnBefore => logTimeoutMiddleware
      // but then on the onError, it flows logTimeoutMiddleware => throwOnBefore
      // so the `expect` in throwOnBefore.onError would verify that we're still dealing
      // with the original error it threw
      const handler = util.promisify(
        middy(async () => {})
          .use(throwOnBefore)
          .use(logTimeoutMiddleware()))

      await handler({}, {})
    })
  })
})
