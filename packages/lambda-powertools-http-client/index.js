const CorrelationIds = require("@buyerassist/dazn-lambda-powertools-correlation-ids");
const HTTP = require("superagent-promise")(require("superagent"), Promise);
const Metrics = require("@dazn/datadog-metrics");
const URL = require("url");

const AWS_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
const FUNCTION_NAME = process.env.AWS_LAMBDA_FUNCTION_NAME;
const FUNCTION_VERSION = process.env.AWS_LAMBDA_FUNCTION_VERSION;

const DEFAULT_TAGS = [
  `awsRegion:${AWS_REGION}`,
  `functionName:${FUNCTION_NAME}`,
  `functionVersion:${FUNCTION_VERSION}`,
];

function getRequest(uri, method) {
  switch (method.toLowerCase()) {
    case "":
    case "get":
      return HTTP.get(uri);
    case "head":
      return HTTP.head(uri);
    case "post":
      return HTTP.post(uri);
    case "put":
      return HTTP.put(uri);
    case "delete":
      return HTTP.del(uri);
    case "patch":
      return HTTP.patch(uri);
    default:
      throw new Error(`unsupported method : ${method.toLowerCase()}`);
  }
}

function setHeaders(request, headers) {
  const headerNames = Object.keys(headers);
  headerNames.forEach((h) => {
    const headerValue = headers[h];
    if (headerValue !== null && headerValue !== undefined) {
      request = request.set(h, headerValue);
    }
  });

  return request;
}

function setQueryStrings(request, qs) {
  if (!qs) {
    return request;
  }

  return request.query(qs);
}

function setBody(request, body) {
  if (!body) {
    return request;
  }

  return request.send(body);
}

// options: {
//    uri/url : string (either uri or url must be specified)
//    method  : GET (default) | POST | PUT | HEAD | DELETE | PATCH
//    headers : object
//    qs      : object
//    body    : object
//    metricName [optional] : string  (e.g. adyenApi)
//    metricTags [optional] : string []  (e.g. ['request_type:submit', 'load_test'], by default we add function name, version, HTTP method, path, and response statusCode for you as tags)
//    timeout [optional] : int (ms)
//    correlationIds : CorrelationIds (an instance of @buyerassist/dazn-lambda-powertools-correlation-ids class)
//  }
const Req = (options) => {
  if (!options) {
    throw new Error("no HTTP request options is provided");
  }

  const uri = options.uri || options.url;
  if (!uri) {
    throw new Error("no HTTP uri or url is specified");
  }

  const correlationIds = (options.correlationIds || CorrelationIds).get();

  // copy the provided headers last so it overrides the values from the context
  let headers = Object.assign({}, correlationIds, options.headers);

  const method = options.method || "get";
  let request = getRequest(uri, method);

  request = setHeaders(request, headers);
  request = setQueryStrings(request, options.qs);
  request = setBody(request, options.body);

  if (options.timeout && typeof options.timeout === "number") {
    request = request.timeout({ deadline: options.timeout });
  }

  const start = Date.now();
  const url = new URL.URL(uri);
  const metricName = options.metricName || url.hostname + ".response";
  const requestMetricTags = [`method:${method}`, `path:${url.pathname}`];
  let metricTags = [].concat(
    DEFAULT_TAGS,
    requestMetricTags,
    options.metricTags || []
  );

  const recordMetrics = ({ status }) => {
    const end = Date.now();
    const latency = end - start;

    metricTags.push(`statusCode:${status}`);

    Metrics.histogram(`${metricName}.latency`, latency, metricTags);
    Metrics.increment(`${metricName}.${status}`, 1, metricTags);
  };

  return request
    .then((resp) => {
      recordMetrics(resp);
      return resp;
    })
    .catch((e) => {
      if (e.response) {
        recordMetrics(e.response);

        if (e.response.error) {
          throw e.response.error;
        }
      }

      throw e;
    });
};

module.exports = Req;
