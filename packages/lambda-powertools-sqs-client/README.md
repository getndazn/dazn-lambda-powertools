# lambda-powertools-sqs-client

SQS client wrapper that knows how to forward correlation IDs (captured via `@perform/lambda-powertools-correlation-ids`).

Main features:

* direct replacement for `AWS.SQS` client
* auto-injects correlation IDs into SQS message when you call `sendMessage` or `sendMessageBatch`
* allow correlation IDs to be overriden with `sendMessageWithCorrelationIds` and `sendMessageBatchWithCorrelationIds` (useful when processing batch-based event sources such as SQS and Kinesis, where every record has its own set of correlation IDs)

## Getting Started

Install from NPM: `npm install @perform/lambda-powertools-sqs-client`

## API

It's exactly the same as the SQS client from the AWS SDK.

```js
const SQS = require('@perform/lambda-powertools-sqs-client')

const sendMessage = async () => {
  const req = {
    MessageBody: JSON.stringify({ message: 'hello sqs' }),
    QueueUrl: 'my-sqs-queue'
  }

  await SQS.sendMessage(req).promise()
}
```
