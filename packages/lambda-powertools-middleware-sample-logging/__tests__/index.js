const consoleLog = jest.spyOn(global.console, 'log')
process.env.LOG_LEVEL = 'INFO'
const Log = require('@perform/lambda-powertools-logger')
const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')

const middy = require('middy')
const sampleLogMiddleware = require('../index')

beforeEach(() => {
  CorrelationIds.clearAll()
  consoleLog.mockClear()
})

const invokeSuccessHandler = (sampleRate) => {
  const handler = middy((event, context, cb) => {
    Log.debug('test')
    cb(null)
  })
  handler.use(sampleLogMiddleware({ sampleRate }))

  handler({}, { awsRequestId: 'test-id' }, () => {})
}

const invokeFailureHandler = (event, awsRequestId, sampleRate) => {
  const handler = middy((event, context, cb) => {
    throw new Error('boom')
  })
  handler.use(sampleLogMiddleware({ sampleRate }))

  handler(event, { awsRequestId }, () => {})
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
    it('enables debug logging', () => {
      CorrelationIds.replaceAllWith({ 'debug-log-enabled': 'true' })

      invokeSuccessHandler(0)
      debugLogWasEnabled()
    })
  })

  describe('when sample rate is 0%', () => {
    it('does not enable debug logging', () => {
      invokeSuccessHandler(0)
      expect(consoleLog).not.toBeCalled()
    })
  })

  describe('when sample rate is 100%', () => {
    it('enables debug logging', () => {
      invokeSuccessHandler(1)
      debugLogWasEnabled()
    })
  })

  describe('when an invocation fails', () => {
    it('writes an error log', () => {
      const event = { test: 'wat' }
      const awsRequestId = 'test-id'

      invokeFailureHandler(event, awsRequestId)
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
})
