# lambda-powertools-pattern-basic

A basic pattern that helps you follow our guidelines around logging and monitoring and be a good citizen in DAZN 2.0 :-).

Main features:

* configures Datadog metrics namespace using the function name if one is not specified already

* configures Datadog default tags with `awsRegion`, `functionName`, `functionVersion` and `environment`

* applies the `@perform/lambda-powertools-middleware-correlation-ids` middleware at 1% sample rate

* applies the `@perform/lambda-powertools-middleware-sample-logging` middleware at 1% sample rate

## Getting Started

Install from NPM: `npm install @perform/lambda-powertools-pattern-basic`

## API

```js
const wrap = require('@perform/lambda-powertools-pattern-basic')

module.exports.handler = wrap(async (event, context) => {
  return 42
})
```