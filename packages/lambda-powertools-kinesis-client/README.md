# lambda-powertools-kinesis-client

Kinesis client wrapper that knows how to forward correlation IDs (captured via `@perform/lambda-powertools-correlation-ids`).

Main features:

* auto-injects correlation IDs into Kinesis records when you call `putRecord` or `putRecords` (only JSON payloads are supported currently)

* direct replacement for `AWS.Kinesis` client

## Getting Started

Install from NPM: `npm install @perform/lambda-powertools-kinesis-client`

## API

It's exactly the same as the Kinesis client from the AWS SDK.

```js
const Kinesis = require('@perform/lambda-powertools-kinesis-client')

const publishEvent = async () => {
  const putRecordReq = {
    StreamName: 'lambda-powertools-demo',
    PartitionKey: uuid(),
    Data: JSON.stringify({ message: 'hello kinesis' })
  }

  await Kinesis.putRecord(putRecordReq).promise()
}

const publishEvents = async () => {
  const putRecordsReq = {
    StreamName: 'lambda-powertools-demo',
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

  await Kinesis.putRecords(putRecordsReq).promise()
}
```