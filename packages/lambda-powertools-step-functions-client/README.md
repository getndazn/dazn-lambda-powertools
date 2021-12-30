# lambda-powertools-step-functions-client

Step Functions (SFN) client wrapper that knows how to forward correlation IDs (captured via `@buyerassist/dazn-lambda-powertools-correlation-ids`).

Main features:

- auto-injects correlation IDs into the invocation payload when you call `startExecution`

- direct replacement for `AWS.StepFunctions` client

## Getting Started

Install from NPM: `npm install @buyerassist/dazn-lambda-powertools-step-functions-client`

## API

It's exactly the same as the Step Functions (SFN) client from the AWS SDK.

```js
const SFN = require("@buyerassist/dazn-lambda-powertools-step-functions-client");

const publishMessage = async () => {
  const req = {
    stateMachineArn: "my-state-machine",
    input: JSON.stringify({ message: "hello sfn" }),
    name: "test",
  };

  await SFN.startExecution(req).promise();
};
```
