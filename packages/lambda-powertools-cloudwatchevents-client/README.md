# lambda-powertools-cloudwatchevents-client

CloudWatchEvents client wrapper that knows how to forward correlation IDs (captured via `@dazn/lambda-powertools-correlation-ids`).

Main features:

* auto-injects correlation IDs into the CloudWatchEvents events when you call `putEvents`

* direct replacement for `AWS.CloudWatchEvents` client

## Getting Started

Install from NPM: `npm install @dazn/lambda-powertools-cloudwatchevents-client`

## API

It's exactly the same as the CloudWatchEvents client from the AWS SDK.

```js
const CloudWatchEvents = require('@dazn/lambda-powertools-cloudwatchevents-client')

const publishEvents = async () => {
  const putEventsReq = {
    Entries: [
      {
        Source: "my-source",
        "Detail-Type": "my-type",
        Detail: JSON.stringify({ message: 'hello cloudwatchevents' })
      },
      {
        Source: "my-source",
        "Detail-Type": "my-type",
        Detail: JSON.stringify({ message: 'hello lambda-powertools' })
      }
    ]
  }

  await CloudWatchEvents.putEvents(putEventsReq).promise()
}
```
