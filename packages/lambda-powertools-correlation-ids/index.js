const DEBUG_LOG_ENABLED = 'debug-log-enabled'

class CorrelationIds {
  constructor (context = {}) {
    this.context = context
  }

  clearAll () {
    this.context = {}
  }

  replaceAllWith (ctx) {
    this.context = ctx
  }

  set (key, value) {
    if (!key.startsWith('x-correlation-')) {
      key = 'x-correlation-' + key
    }

    this.context[key] = value
  }

  get () {
    return this.context
  }

  get debugEnabled () {
    return this.context[DEBUG_LOG_ENABLED] === 'true'
  }

  static clearAll () {
    globalCorrelationIds.clearAll()
  }

  static replaceAllWith (...args) {
    globalCorrelationIds.replaceAllWith(...args)
  }

  static set (...args) {
    globalCorrelationIds.set(...args)
  }

  static get () {
    return globalCorrelationIds.get()
  }
};

const globalCorrelationIds = new CorrelationIds()

module.exports = CorrelationIds
