const middy = require("@middy/core");
const sampleLogging = require("@buyerassist/dazn-lambda-powertools-middleware-sample-logging");
const captureCorrelationIds = require("@buyerassist/dazn-lambda-powertools-middleware-correlation-ids");
const logTimeout = require("@buyerassist/dazn-lambda-powertools-middleware-log-timeout");
const supplementCsv = require("./supplement-csv");

const AWS_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
const FUNCTION_NAME = process.env.AWS_LAMBDA_FUNCTION_NAME;
const FUNCTION_VERSION = process.env.AWS_LAMBDA_FUNCTION_VERSION;
const ENV = process.env.ENVIRONMENT || process.env.STAGE;

if (process.env.DATADOG_PREFIX === undefined) {
  process.env.DATADOG_PREFIX = FUNCTION_NAME + ".";
}

process.env.DATADOG_TAGS = supplementCsv({
  existing: process.env.DATADOG_TAGS,
  additional: {
    awsRegion: AWS_REGION,
    functionName: FUNCTION_NAME,
    functionVersion: FUNCTION_VERSION,
    environment: ENV,
  },
});

process.removeAllListeners('warning');

module.exports = (f) => {
  return middy(f)
    .use(
      captureCorrelationIds({
        sampleDebugLogRate: parseFloat(
          process.env.SAMPLE_DEBUG_LOG_RATE || "0.01"
        ),
      })
    )
    .use(
      sampleLogging({
        sampleRate: parseFloat(process.env.SAMPLE_DEBUG_LOG_RATE || "0.01"),
      })
    )
    .use(logTimeout());
};
