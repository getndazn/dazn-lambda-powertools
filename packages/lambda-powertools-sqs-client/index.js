process.env.AWS_NODEJS_CONNECTION_REUSE_ENABLED = "1";
const SQS = require("aws-sdk/clients/sqs");
const client = new SQS();
const CorrelationIds = require("@buyerassist/dazn-lambda-powertools-correlation-ids");

function addCorrelationIds(correlationIds, messageAttributes) {
  const attributes = {};
  const ids = correlationIds.get();
  for (const key in ids) {
    attributes[key] = {
      DataType: "String",
      StringValue: `${ids[key]}`,
    };
  }

  // use `attributes` as base so if the user's message attributes would override
  // our correlation IDs
  return Object.assign(attributes, messageAttributes || {});
}

client._sendMessage = client.sendMessage;

client.sendMessage = (...args) => {
  return client.sendMessageWithCorrelationIds(CorrelationIds, ...args);
};

client.sendMessageWithCorrelationIds = (correlationIds, params, ...args) => {
  const newMessageAttributes = addCorrelationIds(
    correlationIds,
    params.MessageAttributes
  );
  const extendedParams = {
    ...params,
    MessageAttributes: newMessageAttributes,
  };

  return client._sendMessage(extendedParams, ...args);
};

client._sendMessageBatch = client.sendMessageBatch;

client.sendMessageBatch = (...args) => {
  return client.sendMessageBatchWithCorrelationIds(CorrelationIds, ...args);
};

client.sendMessageBatchWithCorrelationIds = (
  correlationIds,
  params,
  ...args
) => {
  const newEntries = params.Entries.map((entry) => {
    const newMessageAttributes = addCorrelationIds(
      correlationIds,
      entry.MessageAttributes
    );
    return {
      ...entry,
      MessageAttributes: newMessageAttributes,
    };
  });

  const extendedParams = {
    ...params,
    Entries: newEntries,
  };

  return client._sendMessageBatch(extendedParams, ...args);
};

module.exports = client;
