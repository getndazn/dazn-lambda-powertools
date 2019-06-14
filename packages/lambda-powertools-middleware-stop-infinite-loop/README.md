# lambda-powertools-middleware-stop-infinite-loop

A [Middy](https://github.com/middyjs/middy) middleware that will stop an invocation if it's deemed to be part of an infinite loop.

Main features:

* errors if the `call-chain-length` reaches the configured threshold (defaults to `10`)

## Getting Started

Install from NPM: `npm install @perform/lambda-powertools-middleware-stop-infinite-loop`

## API

The middleware accepts an optional constructor parameter `threshold`, which is the max length allowed for the entire call chain.

This middleware is intended to be used alongside `@perform/lambda-powertools-middleware-correlation-ids`, which is responsible for collecting correlation IDs and incrementing the `call-chain-length` (i.e. the number of function invocations that are chained together) at the start of an invocation.

Because this middleware relies on `@perform/lambda-powertools-middleware-correlation-ids`, it needs to be applied **AFTER** `@perform/lambda-powertools-middleware-correlation-ids` (as seen below).

```js
const middy = require('middy')
const correlationIds = require('@perform/lambda-powertools-middleware-correlation-ids')
const stopInfiniteLoop = require('@perform/lambda-powertools-middleware-stop-infinite-loop')

const handler = async (event, context) => {
  return 42
}

module.exports = middy(handler)
  .use(correlationIds())
  .use(stopInfiniteLoop()) // defaults to 10
}
```
