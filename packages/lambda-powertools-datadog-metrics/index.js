const MODE = (process.env.DATADOG_METRICS_MODE || 'async').toLowerCase()

const genClient = () => {
  if (MODE === 'async') {
    return require('./datadog-metrics-async')
  } else if (MODE === 'sync') {
    return require('./datadog-metrics-sync')
  } else {
    throw new Error("process.env.DATADOG_METRICS_MODE should be either 'async' or 'sync'")
  }
}

module.exports = genClient()
