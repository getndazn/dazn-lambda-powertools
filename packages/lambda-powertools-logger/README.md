# lambda-powertools-logger

Logger that is tightly integrated with the rest of the `lambda-powertools`, and knows to automatically include any correlation IDs that have been captured with `@dazn/lambda-powertools-correlation-ids`.

Main features:

* structured logging with JSON

* includes a number of common attributes: `awsRegion`, `functionName`, `functionVersion`, `functionMemorySize` and `environment`

* supports sampling of debug logs with the `enableDebug` function (see below for more details)

* allow log level to be changed live via the `LOG_LEVEL` environment variable (allowed values are `DEBUG`, `INFO`, `WARN` and `ERROR`)

* for `WARN` and `ERROR` logs, include `errorName`, `errorMessage` and `stackTrace`

## Getting Started

Install from NPM: `npm install @dazn/lambda-powertools-logger`

## API

This illustrates the API for logging:

```js
const Log = require('@dazn/lambda-powertools-logger')

Log.debug('this is a debug message')
Log.debug('this is a debug message with attributes', { userId: 'theburningmonk' })

Log.info('this is an info message')
Log.info('this is an info message with attributes', { userId: 'theburningmonk' })

Log.warn('this is a warning message')
Log.warn('this is a warning message with attributes', { userId: 'theburningmonk' })
Log.warn('this is a warning message', new Error('oops'))
Log.warn('this is a warning message with attributes, and error details', { userId: 'theburningmonk' }, new Error('oops'))

Log.error('this is an error message')
Log.error('this is an error message with attributes', { userId: 'theburningmonk' })
Log.error('this is an error message', new Error('oops'))
Log.error('this is an error message with attributes, and error details', { userId: 'theburningmonk' }, new Error('oops'))
```

We don't want to leave debug logging ON in production, as there are significant impact on:

* CloudWatch Logs cost : CloudWatch Logs charges $0.50 per GB of data ingested

* Logz.io cost : Logz.io also charges based on data ingested as well

* Lambda cost : there are also Lambda invocation costs for shipping logs from CloudWatch Logs to Logz.io

* Lambda concurrency : more things being logged = more Lambda invocations to ship them to Logz.io, which can potentially use up too much of our regional quota of concurrent Lambda executions (default limit is 1000, can be raised through support ticket)

* too much noise in the logs, making it harder to find important information

Instead, we should sample debug logs for, say, 1% of invocations.

When used with other lambda-powertools, e.g. `@dazn/lambda-powertools-middleware-sample-logging`, debug logging can be enabled during an invocation using `enableDebug` function.

The `@dazn/lambda-powertools-middleware-correlation-ids` middleware also supplements this behaviour by allowing you to propagate decisions to enable sample logging as a special correlation IDs. This allows an entire call chain (e.g. API Gateway -> Lambda -> Kinesis -> Lambda -> SNS -> Lambda -> HTTP -> API Gateway -> Lambda) to respect the sampling decisions.

```js
const Log = require('@dazn/lambda-powertools-logger')
// LOG_LEVEL is set to WARN via serverless.yml

Log.debug('this is not logged')

const undoDebugLog = Log.enableDebug()

Log.debug('this is logged')

undoDebugLog()

Log.debug('this is not logged')
```
