const Log = require("@buyerassist/dazn-lambda-powertools-logger");
const wrap = require("@buyerassist/dazn-lambda-powertools-pattern-basic");

module.exports.handler = wrap(async ({ x, y }, context) => {
  Log.debug(`adding ${x} and ${y}`);
  return x + y;
});
