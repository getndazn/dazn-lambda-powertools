const DEBUG_LOG_ENABLED = 'debug-log-enabled'

class CorrelationIds {
  constructor () {
    this.context = {}
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
};

const globalCorrelationIds = new CorrelationIds()

module.exports = {
  CorrelationIds,
  clearAll: globalCorrelationIds.clearAll.bind(globalCorrelationIds),
  replaceAllWith: globalCorrelationIds.replaceAllWith.bind(globalCorrelationIds),
  set: globalCorrelationIds.set.bind(globalCorrelationIds),
  get: globalCorrelationIds.get.bind(globalCorrelationIds)
}
