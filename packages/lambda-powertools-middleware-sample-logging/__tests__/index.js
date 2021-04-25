const consoleLog = jest.fn()
global.console.debug = consoleLog
global.console.info = consoleLog
global.console.warn = consoleLog
global.console.error = consoleLog
process.env.LOG_LEVEL = 'INFO'
const Log = require('@dazn/lambda-powertools-logger')
const CorrelationIds = require('@dazn/lambda-powertools-correlation-ids')

const middy = require('@middy/core')
const sampleLogMiddleware = require('../index')

beforeEach(() => {
  CorrelationIds.clearAll()
  consoleLog.mockClear()
})

const invokeSuccessHandler = async (sampleRate) => {
  const handler = middy(async () => {
    Log.debug('test')
  })
  handler.use(sampleLogMiddleware({ sampleRate }))

  await handler({}, { awsRequestId: 'test-id' })
}

const invokeFailureHandler = async (event, awsRequestId, sampleRate) => {
  const handler = middy(async () => {
    throw new Error('boom')
  })
  handler.use(sampleLogMiddleware({ sampleRate }))

  await handler(event, { awsRequestId }).catch(e => {})
}

const debugLogWasEnabled = () => {
  expect(consoleLog).toBeCalled()
  const log = JSON.parse(consoleLog.mock.calls[0])
  expect(log.message).toBe('test')
  expect(log.sLevel).toBe('DEBUG')
  expect(log.level).toBe(20)
}

const errorLogWasWritten = (f) => {
  expect(consoleLog).toBeCalled()
  const log = JSON.parse(consoleLog.mock.calls[0])
  expect(log.sLevel).toBe('ERROR')
  expect(log.level).toBe(50)
  expect(log.message).toBe('invocation failed')

  f(log)
}

describe('Sample logging middleware', () => {
  describe("when 'debug-log-enabled' is 'true'", () => {
    it('enables debug logging', async () => {
      CorrelationIds.replaceAllWith({ 'debug-log-enabled': 'true' })

      await invokeSuccessHandler(0)
      debugLogWasEnabled()
    })
  })

  describe('when sample rate is 0%', () => {
    it('does not enable debug logging', async () => {
      await invokeSuccessHandler(0)
      expect(consoleLog).not.toBeCalled()
    })
  })

  describe('when sample rate is 100%', () => {
    it('enables debug logging', async () => {
      await invokeSuccessHandler(1)
      debugLogWasEnabled()
    })
  })

  describe('when an invocation fails', () => {
    it('writes an error log', async () => {
      const event = { test: 'wat' }
      const awsRequestId = 'test-id'

      await invokeFailureHandler(event, awsRequestId)
      errorLogWasWritten(x => {
        expect(x.errorName).toBe('Error')
        expect(x.errorMessage).toBe('boom')
        expect(x.stackTrace).not.toBeFalsy()
        expect(x.awsRequestId).toBe(awsRequestId)
        expect(x.invocationEvent).toBeDefined()
        expect(JSON.parse(x.invocationEvent)).toEqual(event)
      })
    })
  })

  // it's common for test code to omit context, see #133
  describe('when context is missing', () => {
    it('should not error in the onError handler', async () => {
      const handler = middy(async () => {
        throw new Error('boom')
      })
      handler.use(sampleLogMiddleware({ sampleRate: 1 }))
      await handler({}, undefined).catch(e => {})
      errorLogWasWritten(x => {
        expect(x.errorName).toBe('Error')
        expect(x.errorMessage).toBe('boom')
        expect(x.awsRequestId).toBe('')
      })
    })
  })
})
