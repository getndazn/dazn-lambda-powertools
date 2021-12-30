# lambda-powertools-http-client

HTTP client that automatically forwards correlation IDs (captured via `@buyerassist/dazn-lambda-powertools-correlation-ids`), and follows DAZN's convention around recording metrics around integration points.

Main features:

- auto-forwards any correlation IDs captured with the `@buyerassist/dazn-lambda-powertools-correlation-ids` package as HTTP headers

- auto-record custom metrics using the `@dazn/datadog-metrics` package, which defaults to async mode (i.e. writing to `stdout` in DogStatsD format) but can be configured via the `DATADOG_METRICS_MODE` environment variable

- custom metrics include:

  - `{hostName}.response.latency` [`histogram`]: e.g. `google.com.response.latency`

  - `{hostName}.response.{statusCode}` [`count`]: e.g. `google.com.response.200`

  metric names can be overriden with the `metricName` option (see below for details)

- all custom metrics include the tags `awsRegion`, `functionName`, `functionVersion`, `method` (e.g. `POST`) and `path` (e.g. `/v1/signin`)

- you can add additional tags by passing them in via the `metricTags` option (see below for details)

- supports timeout

## Getting Started

Install from NPM: `npm install @buyerassist/dazn-lambda-powertools-http-client`

## API

Basic usage looks like this:

```js
const HTTP = require("@buyerassist/dazn-lambda-powertools-http-client");

const sayIt = async () => {
  const httpRequest = {
    uri: `https://example.com/dev/say`,
    method: "post",
    body: { message: "hello world" },
  };

  await HTTP(httpRequest);
};
```

It's essentially a function that accepts a request of type:

```js
{
  uri/url : string (either uri or url must be specified)
  method  : GET (default) | POST | PUT | HEAD | DELETE | PATCH
  headers : object
  qs      : object
  body    : object
  metricName [optional] : string     // override the default metric name, e.g. 'adyenApi', which changes metrics to 'adyenapi.latency' and 'adyenapi.202'
  metricTags [optional] : string []  // additional tags for metrics, e.g. ['request_type:submit', 'load_test']
  timeout [optional] : int (millis)
}
```
