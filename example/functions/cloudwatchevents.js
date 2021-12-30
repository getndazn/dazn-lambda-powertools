const SNS = require("@buyerassist/dazn-lambda-powertools-sns-client");
const wrap = require("@buyerassist/dazn-lambda-powertools-pattern-basic");
const Log = require("@buyerassist/dazn-lambda-powertools-logger");
const CorrelationIds = require("@buyerassist/dazn-lambda-powertools-correlation-ids");

module.exports.handler = wrap(async (event, context) => {
  console.log(JSON.stringify(event));

  CorrelationIds.set("sns-sender", "cloudwatchevents");
  Log.debug("publishing cloudwatchevents event as SNS message...", { event });

  const req = {
    Message: JSON.stringify(event),
    TopicArn: process.env.TOPIC_ARN,
  };
  return SNS.publish(req).promise();
});
