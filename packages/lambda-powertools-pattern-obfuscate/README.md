# lambda-powertools-pattern-basic

A pattern that helps you follow our guidelines around logging and monitoring and be a good citizen in DAZN 2.0 :-) With added ability to obfuscate personal fields. 

Main features:

* configures Datadog metrics namespace using the function name if one is not specified already

* configures Datadog default tags with `awsRegion`, `functionName`, `functionVersion` and `environment`

* applies the `@perform/lambda-powertools-middleware-correlation-ids` middleware at 1% sample rate

* applies the `@perform/lambda-powertools-middleware-obfuscated-logging` middleware at 1% sample rate

* applies the `@perform/lambda-powertools-middleware-obfuscated-logging` middleware with passed obfuscation filters 
 
## Getting Started

Install from NPM: `npm install @perform/lambda-powertools-pattern-obfuscate`

## API

```js
const wrap = require('@perform/lambda-powertools-pattern-obfuscated')
const obfuscatedWrap = wrap(['Records.*.firstName', 'Records.*.lastName'])

module.exports.handler = obfuscatedWrap(async (event, context) => {
  return 42
})
```