const Log = require("@perform/lambda-powertools-logger");
const CorrelationIds = require("@perform/lambda-powertools-correlation-ids");
const obfuscateFields = require("./obfuscate");

// config should be { obfuscationfilters } where obfuscation filters is an array of references
// To the object to filter.
module.exports = ({ obfuscationFilters, filterOnAfter = false }) => ({
  before: (handler, next) => {
    next()
  },
  after: (handler, next) => {
    if (filterOnAfter) {
      handler.event = obfuscateFields(handler.event);
    }

    next();
  },
  onError: (handler, next) => {
    handler.event = obfuscateFields(handler.event);
    next(handler.error);
  }
})
