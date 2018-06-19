# lambda-powertools-datadog-metrics

Helper module for recording metrics with Datadog. It supports both synchronous (via HTTP) and asynchronous (via Datadog's Lambda integration) modes. **Defaults to asynchronous mode.**

Main features:

* supports both sync and async methods of collecting metrics

* mode can be configured via the `DATADOG_METRICS_MODE` environment variable, use `sync` for sync mode, `async` for async mode

* supports `gauge`, `histogram` and `increment`

* supports tracking of a function (see below for more details)

## Getting Started

Install from NPM: `npm install @perform/lambda-powertools-datadog-metrics`

## API

```js
// if process.env.DATADOG_METRICS_MODE === 'sync' then this will be recording
// metrics with the 'datadog-metrics' package, and would require flushing
// you can use @perform/lambda-powertools-middleware-flush-datadog-metrics to
// take care of that
// if process.env.DATADOG_METRICS_MODE === 'async' then metrics would be
// sent to stdout, using the DogStatsD format
const Datadog = require('@perform/lambda-powertools-datadog-metrics')

Datadog.gauge('key', 42)                        // guage without tags
Datadog.gauge('key', 42, [ 'tag1', 'tag2:42' ]) // gauge with tags
Datadog.gauge('key', 42, [], Date.now())        // guage with timestamp override

Datadog.increment('key')                            // increment by 1, no tags
Datadog.increment('key', 42)                        // increment by 42, no tags
Datadog.increment('key', 42, [ 'tag1', 'tag2:42' ]) // increment by 42, with tags
Datadog.increment('key', 42, [], Date.now())        // increment with timestamp override

Datadog.histogram('key', 42)                        // histogram without tags
Datadog.histogram('key', 42, [ 'tag1', 'tag2:42' ]) // histogram with tags
Datadog.histogram('key', 42, [], Date.now())        // histogram with timestamp override

const f = () => {
  // ...
}

Datadog.trackExecTime(f, 'key')                        // track execution time without tags
Datadog.trackExecTime(f, 'key', [ 'tag1', 'tag2:42' ]) // track execution time with tags
// by default, timestamp of the metric is the time when the function finishes, but you can 
// override the timestamp yourself
Datadog.trackExecTime(f, 'key', [], Date.now())

const asyncF = async () => {
  // ...
}

// track async function execution time without tags
Datadog.trackExecTime(asyncF, 'key')

// track async function execution time with tags
Datadog.trackExecTime(asyncF, 'key', [ 'tag1', 'tag2:42' ])

// track async function execution time with timestamp override
Datadog.trackExecTime(asyncF, 'key', [], Date.now())
```