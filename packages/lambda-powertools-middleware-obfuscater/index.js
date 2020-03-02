const { obfuscate, FILTERING_MODE } = require('./obfuscater')

const obfuscaterMiddleware = ({ obfuscationFilters, filterOnAfter = false, filterOnBefore = false, filterOnError = true, filteringMode = FILTERING_MODE.BLACKLIST }) => {
  return ({
    before: (handler, next) => {
      if (filterOnBefore) {
        handler.event = obfuscate(handler.event, obfuscationFilters, filteringMode)
      }
      next()
    },
    after: (handler, next) => {
      if (filterOnAfter) {
        handler.event = obfuscate(handler.event, obfuscationFilters, filteringMode)
      }
      next()
    },
    onError: (handler, next) => {
      if (filterOnError) {
        handler.event = obfuscate(handler.event, obfuscationFilters, filteringMode)
      }
      next(handler.error)
    }
  })
}

module.exports = {
  obfuscaterMiddleware,
  FILTERING_MODE
}
