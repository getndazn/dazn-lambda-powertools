const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')

// Levels here are identical to bunyan practices
// https://github.com/trentm/node-bunyan#levels
const LogLevels = {
  DEBUG: 20,
  INFO: 30,
  WARN: 40,
  ERROR: 50
}

// most of these are available through the Node.js execution environment for Lambda
// see https://docs.aws.amazon.com/lambda/latest/dg/current-supported-versions.html
const DEFAULT_CONTEXT = {
  awsRegion: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION,
  functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
  functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION,
  functionMemorySize: process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE,
  environment: process.env.ENVIRONMENT || process.env.STAGE // convention in our functions
}

class Logger {
  constructor ({
    correlationIds = CorrelationIds,
    level = process.env.LOG_LEVEL
  } = {}) {
    this.correlationIds = correlationIds
    this.level = (level || 'DEBUG').toUpperCase()
    this.originalLevel = this.level

    if (correlationIds.debugEnabled) {
      this.enableDebug()
    }
    this.setLogFunctions()
  }

  get context () {
    return {
      ...DEFAULT_CONTEXT,
      ...this.correlationIds.get()
    }
  }

  isEnabled (level) {
    return level >= (LogLevels[this.level] || LogLevels.DEBUG)
  }

  static parseError (err) {
    if (!err) {
      return {}
    }

    return {
      errorName: err.name,
      errorMessage: err.message,
      stackTrace: err.stack
    }
  }

  log (level, sLevel, includeError, message, params, err) {
    const logMsg = {
      ...this.context,
      ...params,
      ...includeError(err),
      level,
      sLevel,
      message
    }

    // re-order message and params to be appear earlier in the logs
    console.log(JSON.stringify({ message, ...params, ...logMsg }))
  }

  makeLogFunction (levelName) {
    const level = LogLevels[levelName]
    if (!this.isEnabled(level)) {
      return () => { }
    }

    const parseError = level >= LogLevels.WARN ? Logger.parseError : () => { }

    return this.log.bind(this, level, levelName, parseError)
  }

  enableDebug () {
    this.level = 'DEBUG'
    this.setLogFunctions()
    return () => this.resetLevel()
  }

  resetLevel () {
    this.level = this.originalLevel
    this.setLogFunctions()
  }

  setLogFunctions () {
    this.debug = this.makeLogFunction('DEBUG')
    this.info = this.makeLogFunction('INFO')
    this.warn = this.makeLogFunction('WARN')
    this.error = this.makeLogFunction('ERROR')
  }

  static debug (...args) {
    globalLogger.debug(...args)
  }

  static info (...args) {
    globalLogger.info(...args)
  }

  static warn (...args) {
    globalLogger.warn(...args)
  }

  static error (...args) {
    globalLogger.error(...args)
  }

  static enableDebug () {
    return globalLogger.enableDebug()
  }

  static resetLevel () {
    globalLogger.resetLevel()
  }
}

const globalLogger = new Logger()

module.exports = Logger
