const metrics = require('datadog-metrics')

if (!process.env.DATADOG_API_KEY) {
  throw new Error('process.env.DATADOG_API_KEY is missing, you will not be able to publish metrics to Datadog synchronously without it. Please set the env variable or switch to async mode instead.')
}

let isInitialized = false

function init () {
  if (isInitialized) {
    return
  }

  let defaultTags = []
  if (process.env.DATADOG_TAGS) {
    defaultTags = process.env.DATADOG_TAGS.split(',').map(x => x.trim()).filter(x => x)
  }

  let prefix = process.env.DATADOG_PREFIX
  let flushInterval = parseInt(process.env.DATADOG_FLUSH_INTERVAL || '15')

  const initOptions = {
    apiKey: process.env.DATADOG_API_KEY,
    prefix: prefix,
    defaultTags: defaultTags,
    flushIntervalSeconds: flushInterval
  }

  try {
    metrics.init(initOptions)
  } catch (err) {
    console.error('failed to initialize datadog-metrics', initOptions, err)
  }

  isInitialized = true
}

const gauge = (key, value, tags, timestamp = Date.now()) => {
  init()
  metrics.gauge(key, value, tags || [], timestamp)
}

const increment = (key, value = 1, tags, timestamp = Date.now()) => {
  init()
  metrics.increment(key, value, tags || [], timestamp)
}

const histogram = (key, value, tags, timestamp = Date.now()) => {
  init()
  metrics.histogram(key, value, tags || [], timestamp)
}

const distribution = (key, value, tags, timestamp = Date.now()) => {
  // unfortunately, it's not supported by the underlying node-datadog-metrics package yet
  // open issue: https://github.com/dbader/node-datadog-metrics/issues/46
  // init()
  // metrics.distribution(key, value, tags || [], timestamp)
}

const trackExecTime = (f, key, tags, timestamp) => {
  if (!f || typeof f !== 'function') {
    throw new Error('trackExecTime requires a function, eg. () => 42')
  }

  if (!key) {
    throw new Error('trackExecTime requires a key, eg. "CloudSearch-latency"')
  }

  init()

  const start = Date.now()
  const res = f()

  // anything with a 'then' function can be considered a Promise...
  // http://stackoverflow.com/a/27746324/55074
  if (typeof res.then === 'function') {
    return res.then(x => {
      const end = Date.now()

      // the timestamp of the metric should tell us "when" the execution time was taken
      // which is at the end, hence defaulting to `end`
      timestamp = timestamp || end
      histogram(key, end - start, tags, timestamp)
      return x
    })
  } else {
    const end = Date.now()

    // the timestamp of the metric should tell us "when" the execution time was taken
    // which is at the end, hence defaulting to `end`
    timestamp = timestamp || end
    histogram(key, end - start, tags, timestamp)
    return res
  }
}

module.exports = {
  gauge,
  increment,
  histogram,
  distribution,
  trackExecTime
}
