# lambda-powertools-pattern-basic

A basic pattern that helps you follow our guidelines around logging and monitoring.

Main features:

* configures Datadog metrics namespace using the function name if one is not specified already

* configures Datadog default tags with `awsRegion`, `functionName`, `functionVersion` and `environment`

* applies the `@perform/lambda-powertools-middleware-correlation-ids` middleware at a default 1% sample rate

* applies the `@perform/lambda-powertools-middleware-sample-logging` middleware at a default 1% sample rate

* applies the `@perform/lambda-powertools-middleware-log-timeout` middleware at default 10ms threshold (i.e. log an error message 10ms before an invocation actually times out)

* allow override for the default 1% sample rate via a `SAMPLE_DEBUG_LOG_RATE` environment variable, to sample debug logs at 5% rate then set `SAMPLE_DEBUG_LOG_RATE` to `0.05`

## Getting Started

Install from NPM: `npm install @perform/lambda-powertools-pattern-basic`

## API

```js
const wrap = require('@perform/lambda-powertools-pattern-basic')

module.exports.handler = wrap(async (event, context) => {
  return 42
})
```
