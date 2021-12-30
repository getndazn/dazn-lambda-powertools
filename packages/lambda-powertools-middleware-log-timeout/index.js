const Log = require("@buyerassist/dazn-lambda-powertools-logger");

const createTimer = (event, context, thresholdMillis) => {
  if (typeof context.getRemainingTimeInMillis !== "function") {
    return null;
  }

  const timeLeft = context.getRemainingTimeInMillis();
  const timeoutMs = timeLeft - thresholdMillis;
  const timer = setTimeout(() => {
    const awsRequestId = context.awsRequestId;
    const invocationEvent = JSON.stringify(event);
    Log.error("invocation timed out", { awsRequestId, invocationEvent });
  }, timeoutMs);

  return timer;
};

const hasTimer = (context) => {
  return (
    context.lambdaPowertoolsLogTimeoutMiddleware &&
    context.lambdaPowertoolsLogTimeoutMiddleware.timer
  );
};

module.exports = (thresholdMillis = 10) => {
  return {
    before: async (request) => {
      const timer = createTimer(
        request.event,
        request.context,
        thresholdMillis
      );
      Object.defineProperty(
        request.context,
        "lambdaPowertoolsLogTimeoutMiddleware",
        {
          enumerable: false,
          value: { timer },
        }
      );
    },
    after: async (request) => {
      if (hasTimer(request.context)) {
        clearTimeout(
          request.context.lambdaPowertoolsLogTimeoutMiddleware.timer
        );
      }
    },
    onError: async (request) => {
      if (hasTimer(request.context)) {
        clearTimeout(
          request.context.lambdaPowertoolsLogTimeoutMiddleware.timer
        );
      }
    },
  };
};
