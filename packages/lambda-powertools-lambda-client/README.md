# lambda-powertools-lambda-client

Lambda client wrapper that knows how to forward correlation IDs (captured via `@buyerassist/dazn-lambda-powertools-correlation-ids`).

Main features:

- auto-injects correlation IDs into the invocation payload when you call `invoke` or `invokeAsync`

- direct replacement for `AWS.Lambda` client

## Getting Started

Install from NPM: `npm install @buyerassist/dazn-lambda-powertools-lambda-client`

## API

It's exactly the same as the Lambda client from the AWS SDK.

```js
const Lambda = require("@buyerassist/dazn-lambda-powertools-lambda-client");

const invoke = async () => {
  const invokeReq = {
    FunctionName: "my-function",
    InvocationType: "Event",
    Payload: JSON.stringify({ message: "hello lambda" }),
  };

  await Lambda.invoke(invokeReq).promise();

  const invokeAsyncReq = {
    FunctionName: "my-function",
    InvokeArgs: JSON.stringify({ message: "hello lambda" }),
  };

  await Lambda.invokeAsync(invokeAsyncReq).promise();
};
```
