# lambda-powertools-sns-client

SNS client wrapper that knows how to forward correlation IDs (captured via `@perform/lambda-powertools-correlation-ids`).

Main features:

* auto-injects correlation IDs into SNS message when you call `publish`

* direct replacement for `AWS.SNS` client

## Getting Started

Install from NPM: `npm install @perform/lambda-powertools-sns-client`

## API

It's exactly the same as the SNS client from the AWS SDK.

```js
const SNS = require('@perform/lambda-powertools-sns-client')

const publishMessage = async () => {
  const req = {
    Message: JSON.stringify({ message: 'hello sns' }),
    TopicArn: 'my-sns-topic'
  }

  await SNS.publish(req).promise()
}
```