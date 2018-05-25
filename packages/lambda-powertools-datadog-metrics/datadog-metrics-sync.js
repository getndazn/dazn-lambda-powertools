const metrics = require('datadog-metrics')

const gauge = (key, value, tags=[], timestamp=Date.now()) => {
  metrics.gauge(key, value, tags, timestamp)
}

const increment = (key, value=1, tags=[], timestamp=Date.now()) => {
  metrics.increment(key, value, tags, timestamp)
}

const histogram = (key, value, tags=[], timestamp=Date.now()) => {
  metrics.histogram(key, value, tags, timestamp)
}

module.exports = {
  gauge,
  increment,
  histogram
}