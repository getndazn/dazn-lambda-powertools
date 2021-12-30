const CorrelationIds = require("@buyerassist/dazn-lambda-powertools-correlation-ids");
const Log = require("@buyerassist/dazn-lambda-powertools-logger");

module.exports = (threshold = 10) => {
  return {
    before: async (request) => {
      const len = CorrelationIds.get()["call-chain-length"] || 1;
      if (len >= threshold) {
        let awsRequestId = request.context.awsRequestId;
        let invocationEvent = JSON.stringify(request.event);
        Log.error(
          "Possible infinite recursion detected, invocation is stopped.",
          { awsRequestId, invocationEvent }
        );
        throw new Error(
          `'call-chain-length' reached threshold of ${threshold}, possible infinite recursion`
        );
      }
    },
  };
};
