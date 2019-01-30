process.env.AWS_REGION = 'us-east-1'
process.env.AWS_LAMBDA_FUNCTION_NAME = 'test'
process.env.AWS_LAMBDA_FUNCTION_VERSION = '$LATEST'
process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = 1024
process.env.STAGE = 'dev'

const Log = require('../index')

const consoleLog = jest.spyOn(global.console, 'log')

beforeEach(consoleLog.mockClear)

afterAll(() => consoleLog.mockRestore())

const verify = (f) => {
  expect(consoleLog).toBeCalled()
  const log = JSON.parse(consoleLog.mock.calls[0])
  f(log)
}

const hasRightLevel = (log, expectedLevel) => {
  log('test')
  verify(x => {
    expect(x.message).toBe('test')
    expect(x.sLevel).toBe(expectedLevel)
  })
}

const paramsAreIncluded = log => {
  log('test', { id: 42, name: 'theburningmonk' })
  verify(x => {
    expect(x.id).toBe(42)
    expect(x.name).toBe('theburningmonk')
  })
}

const defaultContextsAreIncluded = log => {
  log('test')
  verify(x => {
    expect(x.awsRegion).toBe('us-east-1')
    expect(x.functionName).toBe('test')
    expect(x.functionVersion).toBe('$LATEST')
    expect(x.functionMemorySize).toBe('1024')
    expect(x.environment).toBe('dev')
  })
}

const paramsCannotOverrideLevelAndMessage = log => {
  log('test', { level: 'london bridge is falling down', message: 'should not see this!' })
  verify(x => {
    expect(x.sLevel).not.toBe('london bridge is falling down')
    expect(x.message).toBe('test')
  })
}

const errorsAreIncluded = log => {
  log('test', { id: 'id' }, new Error('boom'))
  verify(x => {
    expect(x.id).toBe('id')
    expect(x.errorName).toBe('Error')
    expect(x.errorMessage).toBe('boom')
    expect(x).toHaveProperty('stackTrace')
  })
}

const enabledAt = (log, enabledLevels) => {
  const expected = new Set(enabledLevels)
  const allLevels = [ 'DEBUG', 'INFO', 'WARN', 'ERROR' ]
  allLevels.forEach(level => {
    process.env.LOG_LEVEL = level
    consoleLog.mockClear()
    log('test')
    if (expected.has(level)) {
      expect(consoleLog).toBeCalled()      
    } else {
      expect(consoleLog).not.toBeCalled()
    }
  })

}

test('Logs are captured as JSON', () => {
  Log.debug('test')
  verify(log => expect(log.message).toBe('test'))
})

test('Debug logs have "level" of "DEBUG"', () => hasRightLevel(Log.debug, 'DEBUG'))
test('Info logs have "level" of "INFO"',   () => hasRightLevel(Log.debug, 'DEBUG'))
test('Warn logs have "level" of "WARN"',   () => hasRightLevel(Log.warn, 'WARN'))
test('Error logs have "level" of "ERROR"', () => hasRightLevel(Log.error, 'ERROR'))

test('Default contexts (region, funciton, env) are included in debug logs', () => defaultContextsAreIncluded(Log.debug))
test('Default contexts (region, funciton, env) are included in info logs',  () => defaultContextsAreIncluded(Log.debug))
test('Default contexts (region, funciton, env) are included in warn logs',  () => defaultContextsAreIncluded(Log.debug))
test('Default contexts (region, funciton, env) are included in error logs', () => defaultContextsAreIncluded(Log.debug))

test('Params are included in debug logs', () => paramsAreIncluded(Log.debug))
test('Params are included in info logs',  () => paramsAreIncluded(Log.info))
test('Params are included in warn logs',  () => paramsAreIncluded(Log.warn))
test('Params are included in error logs', () => paramsAreIncluded(Log.error))

test("Params can't override level and message [debug]", () => paramsCannotOverrideLevelAndMessage(Log.debug))
test("Params can't override level and message [info]",  () => paramsCannotOverrideLevelAndMessage(Log.info))
test("Params can't override level and message [warn]",  () => paramsCannotOverrideLevelAndMessage(Log.warn))
test("Params can't override level and message [error]", () => paramsCannotOverrideLevelAndMessage(Log.error))

test('Error details are included in warn logs',  () => errorsAreIncluded(Log.warn))
test('Error details are included in error logs', () => errorsAreIncluded(Log.error))

test('Debug logs are enabled at DEBUG level', () => enabledAt(Log.debug, [ 'DEBUG' ]))
test('Info logs are enabled at DEBUG and INFO levels', () => enabledAt(Log.info,  [ 'DEBUG', 'INFO' ]))
test('Warn logs are enabled at DEBUG, INFO and WARN levels', () => enabledAt(Log.warn,  [ 'DEBUG', 'INFO', 'WARN' ]))
test('Error logs are enabled at all levels', () => enabledAt(Log.error, [ 'DEBUG', 'INFO', 'WARN', 'ERROR' ]))

test('enableDebug() temporarily enables logging at DEBUG level', () => {
  process.env.LOG_LEVEL = 'INFO'

  const rollback = Log.enableDebug()

  Log.debug('this should be logged')

  verify(x => expect(x.message).toBe('this should be logged'))

  consoleLog.mockClear()

  rollback()  // back to INFO logging

  Log.debug('this should not be logged')

  expect(consoleLog).not.toBeCalled()
})