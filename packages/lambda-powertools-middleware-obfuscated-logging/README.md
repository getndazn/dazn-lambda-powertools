# lambda-powertools-middleware-obfuscated-logging

A [Middy](https://github.com/middyjs/middy) middleware that will enable debug logging for a configurable % of invocations. Defaults is 1%.

Main features:

* integrates with the `@perform/lambda-powertools-logger` package to enable debug logging

* integrates with the `@perform/lambda-powertools-correlation-ids` package to allow sampling decision to flow through correlation IDs - i.e. enable debug logging at the edge, and the entire call chain will respect that decision

* enables debug logging for some % (defaults to 1%) of invocations

* records an error log message with the invocation event as attribute when an invocation errors. These invocation errors may be obfuscated to avoid the leaking of Personal Identifiable Information. 

## Getting Started

Install from NPM: `npm install @perform/lambda-powertools-middleware-obfuscated-logging`

Alternatively, if you use the template `@perform/lambda-powertools-pattern-obfuscation` then this would be configured for you.

## API

Accepts a configuration object of the following shape:

```js
{
  sampleRate: double [between 0 and 1]
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
const obfuscatedLogging = require('@perform/lambda-powertools-middleware-sample-logging')

const handler = async (event, context) => {
  return 42
}

module.exports = middy(handler)
  .use(obfuscatedLogging({ sampleRate: 0.01, obfuscationFilters: ["example.example"] }))
}
```

This middleware is often used alongside the `@perform/lambda-powertools-middleware-correlation-ids` middleware to implement sample logging. It's **recommended** that you use the `@perform/lambda-powertools-pattern-obfuscation` which configures both to enable debug logging at 1% of invocations.