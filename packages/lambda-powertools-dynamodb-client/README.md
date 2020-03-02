# lambda-powertools-dynamodb-client

DynamoDB client wrapper that knows how to forward correlation IDs (captured via `@dazn/lambda-powertools-correlation-ids`).

Main features:

* auto-injects correlation IDs into the DynamoDB item(s) so they are available in the DynamoDB Stream

* direct replacement for `AWS.DynamoDB.Document` client

## Getting Started

Install from NPM: `npm install @dazn/lambda-powertools-dynamodb-client`

## API

It's exactly the same as the DynamoDB Document client from the AWS SDK.

```js
const DynamoDB = require('@dazn/lambda-powertools-dynamodb-client')

await DynamoDB.put({
  TableName: 'table-name',
  Item: {
    Id: 'theburningmonk'
  }
}).promise()

await DynamoDB.update({
  TableName: 'table-name',
  Key: { Id: 'theburningmonk' },
  UpdateExpression: 'SET #url = :url',
  ExpressionAttributeNames: {
    '#url': 'url'
  },
  ExpressionAttributeValues: {
    ':url': 'https://theburningmonk.com'
  }
}).promise()

await DynamoDB.batchWrite({
  RequestItems: {
    ['table-name']: [
      {
        DeleteRequest: {
          Key: { Id: 'theburningmonk' }
        }
      },
      {
        PutRequest: {
          Item: {
            Id: 'theburningmonk'
          }
        }
      }
    ]
  }
}).promise()

await DynamoDB.transactWrite({
  TransactItems: [
    {
      Put: {
        TableName: 'table-name',
        Item: {
          Id: 'theburningmonk'
        }
      }
    },
    {
      Update: {
        TableName: tableName,
        Key: { Id: 'theburningmonk' },
        UpdateExpression: 'SET #url = :url',
        ExpressionAttributeNames: {
          '#url': 'url'
        },
        ExpressionAttributeValues: {
          ':url': 'https://theburningmonk.com'
        }
      }
    }
  ]
}).promise()
```
