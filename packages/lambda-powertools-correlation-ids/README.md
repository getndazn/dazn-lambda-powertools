# lambda-powertools-correlation-ids

A helper module for recording correlation IDs.

Main features:

* allows you to fetch, update, and delete correlation IDs

* respects convention for correlation IDs - i.e. `x-correlation-`

* Manually enable/disable debug logging (`debug-log-enabled`) to be picked up by other/downstream middleware

* allows you to store more than one correlation IDs, which allows you to *correlate* logs on multiple dimensions (e.g. by `x-correlation-user-id`, or `x-correlation-order-id`, etc.)

## Getting Started

Install from NPM: `npm install @dazn/lambda-powertools-correlation-ids`

## API

```js
const CorrelationIds = require('@dazn/lambda-powertools-correlation-ids')

// automatically inserts 'x-correlation-' prefix if not provided
CorrelationIds.set('id', '12345678') // records id as x-correlation-id
CorrelationIds.set('x-correlation-username', 'theburningmonk') // records as x-correlation-username

// Manully enable debug logging (debug-log-enabled)
CorrelationIds.debugLoggingEnabled = true

const myCorrelationIds = CorrelationIds.get()
// {
//   'x-correlation-id': '12345678',
//   'x-correlation-username': 'theburningmonk',
//   'debug-log-enabled': 'true'
// }

CorrelationIds.clearAll() // removes all recorded correlation IDs
CorrelationIds.replaceAllWith({  // bypasses the 'x-correlation-' convention
  'debug-log-enabled': 'true',
  'User-Agent': 'jest test'
})

// Disable debug logging
CorrelationIds.debugLoggingEnabled = false
```

In practice, you're likely to only need `set` when you want to record correlation IDs from your function.

The middleware, `@dazn/lambda-powertools-middleware-correlation-ids`, would automatically capture the correlation IDs from the invocation event for supported event sources:

* API Gateway (via HTTP headers)

* Kinesis (via the JSON payload)

* SNS (via message attributes)

* any invocation event with the special field `__context__` (which is how we inject them with the Step Functions and Lambda clients below)

Whilst other power tools would use `get` to make use of the correlation IDs:

* `@dazn/lambda-powertools-logger` includes recorded correlation IDs in logs

* `@dazn/lambda-powertools-http-client` includes recorded correlation IDs as HTTP headers when you make a HTTP request

* `@dazn/lambda-powertools-sns-client` includes recorded correlation IDs as SNS message attributes when you publish a message to SNS (ie. `SNS.publish`)

* `@dazn/lambda-powertools-kinesis-client` injects recorded correlation IDs as part of the event payload when you publish event(s) to Kinesis (ie. `Kinesis.putRecord` and `Kinesis.putRecords`)

* `@dazn/lambda-powertools-step-functions-client` injects recorded correlation IDs as part of the payload when you start a Step Functions execution (ie. `SFN.startExecution`)

* `@dazn/lambda-powertools-lambda-client` injects recorded correlation IDs as part of the invocation payload when you invoke a Lambda function directly (ie. `Lambda.invoke` and `Lambda.invokeAsync`)
