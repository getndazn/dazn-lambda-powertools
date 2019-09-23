# lambda-powertools-middleware-log-timeout

A [Middy](https://github.com/middyjs/middy) middleware that will log a timeout error message **just before** the function actually times out.

Main features:

* records an error log message `invocation timed out` (with the invocation event as attribute) when an invocation times out

## Getting Started

Install from NPM: `npm install @dazn/lambda-powertools-middleware-log-timeout`

Alternatively, if you use the template `@dazn/lambda-powertools-pattern-basic` then this would be configured for you.

## API

The middleware accepts the following optional constructor parameters:
- `thresholdMillis` 
  - number of millis before an invocation is timed out, that an error message is logged. [default: **10ms**]
- `customLogger` 
  - custom logging function which will be invoked when a timeout occurs. [default: `Log.error('invocation timed out', { awsRequestId, invocationEvent })`]
  - function will be invoked with `(event, context)` as input params
  
Default configuration:
```js
const middy = require('middy')
const logTimeout = require('@dazn/lambda-powertools-middleware-log-timeout')

const handler = async (event, context) => {
  return 42
}

module.exports = middy(handler)
  // or .use(logTimeout(50)) to log the timeout error message 50ms before invocation times out
  .use(logTimeout()) // defaults to 10ms
}
```

Custom configuration:
```js
const middy = require('middy')
const logTimeout = require('@dazn/lambda-powertools-middleware-log-timeout')
const metrics = require('@dazn/datadog-metrics');

const handler = async (event, context) => {
  return 42
}

module.exports = middy(handler)
  // log the timeout error message 50ms before invocation times out
  .use(logTimeout(50, (event, context) => {
    // construct custom log messages
    console.log(JSON.stringify({
      message: 'custom log',
      invocationEvent: event,
      awsRequestId: context.awsRequestId
    }))
    metrics.increment('failed.timeout', 1);
  })
}
```


It's **recommended** that you use the `@dazn/lambda-powertools-pattern-basic` which configures this middleware along with other useful middlewares.
