process.env.AWS_NODEJS_CONNECTION_REUSE_ENABLED = "1";
const DynamoDB = require("aws-sdk/clients/dynamodb");
const client = new DynamoDB.DocumentClient();
const CorrelationIds = require("@buyerassist/dazn-lambda-powertools-correlation-ids");
const chunk = require("lodash.chunk");

const addCorrelationIds = (correlationIds, item) => {
  const ids = correlationIds.get();
  return {
    __context__: ids,
    ...item,
  };
};

const contextExprName = "#LambdaPowertoolsContext";
const contextExprValue = ":LambdaPowertoolsContext";
const addCorrelationIdsToUpdate = (correlationIds, params) => {
  // we need to insert our expression "SET #context = :context", but there can
  // only be one SET statement in the update expression
  // so we need to work out if there is a SET statement already, and if so
  // add ours to the end, or add a SET statement to the update expression
  const updateExpr = params.UpdateExpression;

  // e.g. [ 'Add', '#count :value', 'REMOVE', 'Age' ]
  const exprSegments = updateExpr
    .split(/(SET|REMOVE|ADD|REMOVE)/i)
    .filter((x) => x)
    .map((x) => x.trim());

  // e.g. [ ['Add', '#count :value'], ['REMOVE', 'Age'] ]
  const exprs = chunk(exprSegments, 2);

  const setExpr = exprs.find(([key, _values]) => key.toLowerCase() === "set");
  if (setExpr) {
    setExpr[1] += `, ${contextExprName} = ${contextExprValue}`;
  } else {
    exprs.push(["SET", `${contextExprName} = ${contextExprValue}`]);
  }

  const newUpdateExpr = exprs
    .map(([key, values]) => `${key} ${values}`)
    .join(" ");
  const newExprNames = Object.assign({}, params.ExpressionAttributeNames);
  newExprNames[contextExprName] = "__context__";
  const newExprValues = Object.assign({}, params.ExpressionAttributeValues);
  newExprValues[contextExprValue] = correlationIds.get();

  return {
    ...params,
    UpdateExpression: newUpdateExpr,
    ExpressionAttributeNames: newExprNames,
    ExpressionAttributeValues: newExprValues,
  };
};

client._put = client.put;

client.put = (...args) => {
  return client.putWithCorrelationIds(CorrelationIds, ...args);
};

client.putWithCorrelationIds = (correlationIds, params, ...args) => {
  const newParams = {
    ...params,
    Item: addCorrelationIds(correlationIds, params.Item),
  };

  return client._put(newParams, ...args);
};

client._update = client.update;

client.update = (...args) => {
  return client.updateWithCorrelationIds(CorrelationIds, ...args);
};

client.updateWithCorrelationIds = (correlationIds, params, ...args) => {
  const newParams = addCorrelationIdsToUpdate(correlationIds, params);
  return client._update(newParams, ...args);
};

client._batchWrite = client.batchWrite;

client.batchWrite = (...args) => {
  return client.batchWriteWithCorrelationIds(CorrelationIds, ...args);
};

client.batchWriteWithCorrelationIds = (correlationIds, params, ...args) => {
  const tableNames = Object.keys(params.RequestItems);
  const newRequestItems = {};
  tableNames.forEach((tableName) => {
    const newReqs = params.RequestItems[tableName].map((req) => {
      const newReq = {};
      if (req.DeleteRequest) {
        newReq.DeleteRequest = req.DeleteRequest;
      }

      if (req.PutRequest) {
        newReq.PutRequest = {
          ...req.PutRequest,
          Item: addCorrelationIds(correlationIds, req.PutRequest.Item),
        };
      }

      return newReq;
    });

    newRequestItems[tableName] = newReqs;
  });

  const newParams = {
    ...params,
    RequestItems: newRequestItems,
  };

  return client._batchWrite(newParams, ...args);
};

client._transactWrite = client.transactWrite;

client.transactWrite = (...args) => {
  return client.transactWriteWithCorrelationIds(CorrelationIds, ...args);
};

client.transactWriteWithCorrelationIds = (correlationIds, params, ...args) => {
  const newTransactItems = params.TransactItems.map((transaction) => {
    const newTransaction = {
      ...transaction,
    };

    if (transaction.Put) {
      newTransaction.Put = {
        ...transaction.Put,
        Item: addCorrelationIds(correlationIds, transaction.Put.Item),
      };
    }

    if (transaction.Update) {
      newTransaction.Update = addCorrelationIdsToUpdate(
        correlationIds,
        transaction.Update
      );
    }

    return newTransaction;
  });

  const newParams = {
    ...params,
    TransactItems: newTransactItems,
  };

  return client._transactWrite(newParams, ...args);
};

module.exports = client;
