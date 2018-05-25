const MODE = process.env.DATADOG_METRICS_MODE || 'async'

module.exports = MODE === 'async' 
  ? require('./datadog-metrics-async') 
  : require('./datadog-metrics-sync')