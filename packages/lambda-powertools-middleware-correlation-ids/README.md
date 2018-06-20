# lambda-powertools-middleware-correlation-ids

A [Middy](https://github.com/middyjs/middy) middleware that extracts correlation IDs from the invocation event and stores them with the `@perform/lambda-powertools-correlation-ids` package.

Main features:

* stores correlation IDs with the `@perform/lambda-powertools-correlation-ids` package

* supports API Gateway events (HTTP headers)

* supports SNS events (message attributes)

* supports Kinesis events (looks for a `__context__` property in the JSON payload)

* supports direct invocations and Step Function tasks (looks for a `__context__` property in the JSON event)

* initializes correlation IDs using the Lambda request ID

* captures anything with prefix `x-correlation-`

* cpatures `User-Agent` from API Gateway events

* captures or initializes the `debug-log-enabled` decision based on configuration (see below) to ensure invocation follows upstream decision to enable debug logging for a small % of invocations

## Getting Started

Install from NPM: `npm install @perform/lambda-powertools-middleware-correlation-ids`

Alternatively, if you use the template `@perform/lambda-powertools-pattern-basic` then this would be configured for you.

## API

Accepts a configuration object of the following shape:

```js
{
  sampleDebugLogRate: double [between 0 and 1]
}
```

```js
const middy = require('middy')
const correlationIds = require('@perform/lambda-powertools-middleware-correlation-ids')

const handler = async (event, context) => {
  return 42
}

module.exports = middy(handler)
  .use(correlationIds({ sampleDebugLogRate: 0.01 }))
}
```

This middleware is often used alongside the `@perform/lambda-powertools-middleware-sample-logging` middleware to implement sample logging. It's **recommended** that you use the `@perform/lambda-powertools-pattern-basic` which configures both to enable debug logging at 1% of invocations.