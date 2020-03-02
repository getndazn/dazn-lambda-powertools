# `lambda-powertools-firehose-client`

Firehose client wrapper that knows how to forward correlation IDs (captured via `@dazn/lambda-powertools-correlation-ids`).

Main features:

* auto-injects correlation IDs into Firehose records when you call `putRecord` or `putRecordBatch` (only JSON payloads are supported currently)

* direct replacement for `AWS.Firehose` client

## Getting Started

Install from NPM: `npm install @dazn/lambda-powertools-firehose-client`

## API

It's exactly the same as the Kinesis client from the AWS SDK.

```js
const Firehose = require('@dazn/lambda-powertools-firehose-client')

const publishEvent = async () => {
  const putRecordReq = {
    DeliveryStreamName: 'lambda-powertools-demo',
    PartitionKey: uuid(),
    Data: JSON.stringify({ message: 'hello firehose' })
  }

  await Firehose.putRecord(putRecordReq).promise()
}

const publishEvents = async () => {
  const putRecordBatchReq = {
    DeliveryStreamName: 'lambda-powertools-demo',
    Records: [
      {
        PartitionKey: uuid(),
        Data: JSON.stringify({ message: 'hello kinesis' })
      },
      {
        PartitionKey: uuid(),
        Data: JSON.stringify({ message: 'hello lambda-powertools' })
      }
    ]
  }

  await Firehose.putRecordBatch(putRecordBatchReq).promise()
}
```
