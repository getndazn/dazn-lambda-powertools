# lambda-powertools-eventbridge-client

EventBridge client wrapper that knows how to forward correlation IDs (captured via `@buyerassist/dazn-lambda-powertools-correlation-ids`).

Main features:

- auto-injects correlation IDs into the EventBridge events when you call `putEvents`

- direct replacement for `AWS.EventBridge` client

## Getting Started

Install from NPM: `npm install @buyerassist/dazn-lambda-powertools-eventbridge-client`

## API

It's exactly the same as the EventBridge client from the AWS SDK.

```js
const EventBridge = require("@buyerassist/dazn-lambda-powertools-eventbridge-client");

const publishEvents = async () => {
  const putEventsReq = {
    Entries: [
      {
        Source: "my-source",
        "Detail-Type": "my-type",
        Detail: JSON.stringify({ message: "hello eventbridge" }),
      },
      {
        Source: "my-source",
        "Detail-Type": "my-type",
        Detail: JSON.stringify({ message: "hello lambda-powertools" }),
      },
    ],
  };

  await EventBridge.putEvents(putEventsReq).promise();
};
```
