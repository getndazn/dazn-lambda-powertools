const Log = require("@buyerassist/dazn-lambda-powertools-logger");
const wrap = require("@buyerassist/dazn-lambda-powertools-pattern-basic");

module.exports.handler = wrap(async ({ z }, context) => {
  Log.debug(`doubling ${z}`);
  return z * 2;
});
