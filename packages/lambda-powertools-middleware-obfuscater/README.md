# lambda-powertools-middleware-obfuscater

A [Middy](https://github.com/middyjs/middy) middleware that will enable debug logging for a configurable % of invocations. Defaults is 1%.

Main features:

* records an error log message with the invocation event as attribute when an invocation errors. These invocation errors may be obfuscated to avoid the leaking of Personal Identifiable Information.

## Getting Started

Install from NPM: `npm install @perform/lambda-powertools-middleware-obfuscater`

Alternatively, if you use the template `@perform/lambda-powertools-pattern-obfuscate` then this would be configured for you.

## API

Accepts a configuration object of the following shape:

```js
{
  obfuscationFilter: string array formatted like ["object.key.to.obfuscate"]
}
```

```js
  { 
    Records: [
        { firstName: "personal" secondName: "identifiable" email: "inform@ti.on" },
        { firstName: "second" secondName: "personal" email: "inform@ti.on" }
      ]
  }

  // To filter the above object you would pass 
  const obfuscationFilter = ["Records.*.firstName", "Records.*.secondName", "Records.*.email"]
```

The output would be... 

```js
{ 
  Records: [
      { firstName: "********" secondName: "************" email: "******@**.**" },
      { firstName: "******" secondName: "********" email: "******@**.**" }
    ]
}
```

similarly, you can filter entire objects, for instance. 
```js
  const obfuscationFilter = ["Records.*.personal"]
  { 
    Records: [
      { personal: { firstName: "********" secondName: "************" email: "******@**.**" } }.
      { personal: { firstName: "******" secondName: "********" email: "******@**.**", address: { postcode: "******", street: "* ****** ***", country: "**" }}}
    ]
  }
```

This will recursively filter every object and subobjects

```js
const middy = require('middy')
const obfuscatedLogging = require('@perform/lambda-powertools-middleware-obfuscater')

const handler = async (event, context) => {
  return 42
}

module.exports = middy(handler)
  .use(obfuscatedLogging({ sampleRate: 0.01, obfuscationFilters: ["example.example"] }))
}
```

This middleware is often used alongside the `@perform/lambda-powertools-middleware-correlation-ids` middleware to implement sample logging. It's **recommended** that you use the `@perform/lambda-powertools-pattern-obfuscate` which configures both to enable debug logging at 1% of invocations.
