const metrics = require('datadog-metrics')

const gauge = (key, value, tags, timestamp=Date.now()) => {
  metrics.gauge(key, value, tags || [], timestamp)
}

const increment = (key, value=1, tags, timestamp=Date.now()) => {
  metrics.increment(key, value, tags || [], timestamp)
}

const histogram = (key, value, tags, timestamp=Date.now()) => {
  metrics.histogram(key, value, tags || [], timestamp)
}

const trackExecTime = (f, key, tags, timestamp) => {
  if (!f || typeof f !== "function") {
    throw new Error('trackExecTime requires a function, eg. () => 42')
  }

  if (!key) {
    throw new Error('trackExecTime requires a key, eg. "CloudSearch-latency"')
  }

  const start = new Date().getTime()
  const res = f()
  
  // anything with a 'then' function can be considered a Promise...
  // http://stackoverflow.com/a/27746324/55074
  if (typeof res.then === 'function') {
    return res.then(x => {
      const end = new Date().getTime()
      
      // the timestamp of the metric should tell us "when" the execution time was taken
      // which is at the end, hence defaulting to `end`
      timestamp = timestamp || end
      histogram(key, end-start, tags, timestamp)
      return x
    })    
  } else {
    const end = new Date().getTime()
    
    // the timestamp of the metric should tell us "when" the execution time was taken
    // which is at the end, hence defaulting to `end`
    timestamp = timestamp || end      
    histogram(key, end-start, tags, timestamp)
    return res
  }
}

module.exports = {
  gauge,
  increment,
  histogram,
  trackExecTime
}