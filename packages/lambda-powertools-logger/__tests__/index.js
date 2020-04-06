process.env.AWS_REGION = 'us-east-1'
process.env.AWS_LAMBDA_FUNCTION_NAME = 'test'
process.env.AWS_LAMBDA_FUNCTION_VERSION = '$LATEST'
process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = 1024
process.env.STAGE = 'dev'

const Log = require('../index')

const consoleLog = jest.fn()
global.console.debug = consoleLog
global.console.info = consoleLog
global.console.warn = consoleLog
global.console.error = consoleLog

beforeEach(consoleLog.mockClear)

afterAll(() => consoleLog.mockRestore())

const verify = (f) => {
  expect(consoleLog).toBeCalled()
  const log = JSON.parse(consoleLog.mock.calls[0])
  f(log)
}

const hasRightLevel = (log, expectedSLevel, expectedLevel) => {
  log('test')
  verify(x => {
    expect(x.message).toBe('test')
    expect(x.sLevel).toBe(expectedSLevel)
    expect(x.level).toBe(expectedLevel)
  })
}

const paramsAreIncluded = log => {
  log('test', { id: 42, name: 'theburningmonk', bigInt: BigInt(5) })
  verify(x => {
    expect(x.id).toBe(42)
    expect(x.name).toBe('theburningmonk')
    expect(x.bigInt).toBe('5')
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

const errorsAreIncludedButNotParams = log => {
  log('test', new Error('boom'))
  verify(x => {
    expect(x.errorName).toBe('Error')
    expect(x.errorMessage).toBe('boom')
    expect(x).toHaveProperty('stackTrace')
  })
}

const enabledAt = (method, enabledLevels) => {
  const expected = new Set(enabledLevels)
  const allLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR']
  allLevels.forEach(level => {
    process.env.LOG_LEVEL = level
    const levelLogger = new Log()
    consoleLog.mockClear()
    levelLogger[method]('test')
    if (expected.has(level)) {
      expect(consoleLog).toBeCalled()
    } else {
      expect(consoleLog).not.toBeCalled()
    }
  })
}

describe('Logger', () => {
  it('captures logs as JSON', () => {
    Log.debug('test')
    verify(log => expect(log.message).toBe('test'))
  })

  describe('Level properties', () => {
    it('sets "level" of "DEBUG" for debug logs', () => hasRightLevel(Log.debug, 'DEBUG', 20))
    it('sets "level" of "INFO" for info logs', () => hasRightLevel(Log.info, 'INFO', 30))
    it('sets "level" of "WARN" for warn logs', () => hasRightLevel(Log.warn, 'WARN', 40))
    it('sets "level" of "ERROR" for error logs', () => hasRightLevel(Log.error, 'ERROR', 50))
  })

  describe('Default context (region, function, env)', () => {
    it('includes them in debug logs', () => defaultContextsAreIncluded(Log.debug))
    it('includes them in info logs', () => defaultContextsAreIncluded(Log.info))
    it('includes them in warn logs', () => defaultContextsAreIncluded(Log.warn))
    it('includes them in error logs', () => defaultContextsAreIncluded(Log.error))
  })

  describe('Params', () => {
    it('includes them in debug logs', () => paramsAreIncluded(Log.debug))
    it('includes them in info logs', () => paramsAreIncluded(Log.info))
    it('includes them in warn logs', () => paramsAreIncluded(Log.warn))
    it('includes them in error logs', () => paramsAreIncluded(Log.error))

    describe('when params includes level or message', () => {
      it("doesn't override level and message [debug]", () => paramsCannotOverrideLevelAndMessage(Log.debug))
      it("doesn't override level and message [info]", () => paramsCannotOverrideLevelAndMessage(Log.info))
      it("doesn't override level and message [warn]", () => paramsCannotOverrideLevelAndMessage(Log.warn))
      it("doesn't override level and message [error]", () => paramsCannotOverrideLevelAndMessage(Log.error))
    })
  })

  describe('Error details with params included', () => {
    it('includes error details in warn logs', () => errorsAreIncluded(Log.warn))
    it('includes error details in error logs', () => errorsAreIncluded(Log.error))
  })

  describe('Error details with params NOT included', () => {
    it('includes error details in warn logs', () => errorsAreIncludedButNotParams(Log.warn))
    it('includes error details in error logs', () => errorsAreIncludedButNotParams(Log.error))
  })

  describe('Log level', () => {
    it('enables debug logs at DEBUG level', () => enabledAt('debug', ['DEBUG']))
    it('enables info logs at DEBUG and INFO levels', () => enabledAt('info', ['DEBUG', 'INFO']))
    it('enables warn logs at at DEBUG, INFO and WARN levels', () => enabledAt('warn', ['DEBUG', 'INFO', 'WARN']))
    it('enables error logs at all levels', () => enabledAt('error', ['DEBUG', 'INFO', 'WARN', 'ERROR']))
  })

  describe('.enableDebug', () => {
    it('temporarily enables logging at DEBUG level', () => {
      process.env.LOG_LEVEL = 'INFO'
      const levelLogger = new Log()

      const rollback = levelLogger.enableDebug()

      levelLogger.debug('this should be logged')

      verify(x => expect(x.message).toBe('this should be logged'))

      consoleLog.mockClear()

      rollback() // back to INFO logging

      levelLogger.debug('this should not be logged')

      expect(consoleLog).not.toBeCalled()
    })
  })

  describe('process.env.LOG_LEVEL', () => {
    it('is not case sensitive', () => {
      const shouldBeLogged = (logLevel, log, expectedLevel) => {
        process.env.LOG_LEVEL = logLevel
        log('this should be logged')
        verify(x => {
          expect(x.message).toBe('this should be logged')
          expect(x.sLevel).toBe(expectedLevel)
        })

        consoleLog.mockClear()
      }

      shouldBeLogged('debug', Log.debug, 'DEBUG')
      shouldBeLogged('deBug', Log.debug, 'DEBUG')
      shouldBeLogged('DeBug', Log.debug, 'DEBUG')

      shouldBeLogged('info', Log.info, 'INFO')
      shouldBeLogged('Info', Log.info, 'INFO')
      shouldBeLogged('InfO', Log.info, 'INFO')

      shouldBeLogged('warn', Log.warn, 'WARN')
      shouldBeLogged('Warn', Log.warn, 'WARN')
      shouldBeLogged('WarN', Log.warn, 'WARN')

      shouldBeLogged('error', Log.error, 'ERROR')
      shouldBeLogged('Error', Log.error, 'ERROR')
      shouldBeLogged('ErroR', Log.error, 'ERROR')
    })

    it('treats misconfigured inputs as DEBUG', () => {
      const shouldBeLogged = (logLevel, method) => {
        process.env.LOG_LEVEL = logLevel
        const levelLogger = new Log()
        levelLogger[method]('this should be logged')
        verify(x => expect(x.message).toBe('this should be logged'))

        consoleLog.mockClear()
      }

      shouldBeLogged('bedug', 'debug')
      shouldBeLogged('bedug', 'info')
      shouldBeLogged('bedug', 'warn')
      shouldBeLogged('bedug', 'error')

      shouldBeLogged('inf0', 'debug')
      shouldBeLogged('inf0', 'info')
      shouldBeLogged('inf0', 'warn')
      shouldBeLogged('inf0', 'error')
    })
  })
})
