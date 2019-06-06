# lambda-powertools-middleware-log-timeout

A [Middy](https://github.com/middyjs/middy) middleware that will log a timeout error message **just before** the function actually times out.

Main features:

* records an error log message `invocation timed out` (with the invocation event as attribute) when an invocation times out

## Getting Started

Install from NPM: `npm install @perform/lambda-powertools-middleware-log-timeout`

Alternatively, if you use the template `@perform/lambda-powertools-pattern-basic` then this would be configured for you.

## API

The middleware accepts an optional constructor parameter `thresholdMillis`, which is the number of millis before an invocation is timed out, that an error message is logged. `thresholdMillis` defaults to **10ms**.

```js
const middy = require('middy')
const logTimeout = require('@perform/lambda-powertools-middleware-log-timeout')

const handler = async (event, context) => {
  return 42
}

module.exports = middy(handler)
  // or .use(logTimeout(50)) to log the timeout error message 50ms before invocation times out
  .use(logTimeout()) // defaults to 10ms
}
```

It's **recommended** that you use the `@perform/lambda-powertools-pattern-basic` which configures this middleware along with other useful middlewares.
