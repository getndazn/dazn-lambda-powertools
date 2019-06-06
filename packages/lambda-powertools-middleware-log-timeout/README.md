# lambda-powertools-middleware-log-timeout

A [Middy](https://github.com/middyjs/middy) middleware that will log a timeout error message **just before** the function actually times out.

Main features:

* records an error log message with the invocation event as attribute when an invocation times out

## Getting Started

Install from NPM: `npm install @perform/lambda-powertools-middleware-log-timeout`

Alternatively, if you use the template `@perform/lambda-powertools-pattern-basic` then this would be configured for you.

## API

```js
const middy = require('middy')
const logTimeout = require('@perform/lambda-powertools-middleware-log-timeout')

const handler = async (event, context) => {
  return 42
}

module.exports = middy(handler)
  .use(logTimeout())
}
```

It's **recommended** that you use the `@perform/lambda-powertools-pattern-basic` which configures this middleware along with other useful middlewares.
