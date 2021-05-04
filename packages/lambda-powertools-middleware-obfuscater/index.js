const { obfuscate, FILTERING_MODE } = require('./obfuscater')

const obfuscaterMiddleware = ({ obfuscationFilters, filterOnAfter = false, filterOnBefore = false, filterOnError = true, filteringMode = FILTERING_MODE.BLACKLIST }) => {
  return ({
    before: async (request) => {
      if (filterOnBefore) {
        request.event = obfuscate(request.event, obfuscationFilters, filteringMode)
      }
    },
    after: async (request) => {
      if (filterOnAfter) {
        request.event = obfuscate(request.event, obfuscationFilters, filteringMode)
      }
    },
    onError: async (request) => {
      if (filterOnError) {
        request.event = obfuscate(request.event, obfuscationFilters, filteringMode)
      }
    }
  })
}

module.exports = {
  obfuscaterMiddleware,
  FILTERING_MODE
}
