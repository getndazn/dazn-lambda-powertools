const consoleLog = jest.spyOn(global.console, 'log')

const Log = require('@perform/lambda-powertools-logger')
const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')

const middy = require('middy')
const sampleLogMiddleware = require('../index')

beforeEach(() => {
  process.env.LOG_LEVEL = 'INFO'
  CorrelationIds.clearAll()
  consoleLog.mockClear()
})

const invokeSuccessHandler = (sampleRate) => {
  const handler = middy((event, context, cb) => {
    Log.debug('test')
    cb(null)
  })
  handler.use(sampleLogMiddleware({ sampleRate }))

  handler({}, { awsRequestId: 'test-id' }, (err, result) => {})
}

const invokeFailureHandler = (event, awsRequestId, sampleRate) => {
  const handler = middy((event, context, cb) => {
    throw new Error('boom')
  })
  handler.use(sampleLogMiddleware({ sampleRate }))

  handler(event, { awsRequestId }, (err, result) => {})
}

const debugLogWasEnabled = () => {
  expect(consoleLog).toBeCalled()
  const log = JSON.parse(consoleLog.mock.calls[0])
  expect(log.message).toBe('test')
  expect(log.level).toBe('DEBUG')
}

const errorLogWasWritten = (f) => {
  expect(consoleLog).toBeCalled()
  const log = JSON.parse(consoleLog.mock.calls[0])
  expect(log.level).toBe('ERROR')
  expect(log.message).toBe('invocation failed')

  f(log)
}

test("when 'debug-log-enabled' is 'true', debug log should be enabled", () => {
  CorrelationIds.replaceAllWith({ 'debug-log-enabled': 'true' })

  invokeSuccessHandler(0)
  debugLogWasEnabled()
})

test('when sample rate is 0%, debug log is not enabled', () => {
  invokeSuccessHandler(0)
  expect(consoleLog).not.toBeCalled()
})

test('when sample rate is 100%, debug log is definitely enabled', () => {
  invokeSuccessHandler(1)
  debugLogWasEnabled()
})

test('when an invocation errors, an error log is always written', () => {
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