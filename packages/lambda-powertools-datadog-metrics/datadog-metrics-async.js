const gauge = (key, value, tags, timestamp=Date.now()) => {
  tags = tags || []
  console.log(`MONITORING|${timestamp}|${value}|gauge|${key}|#${tags.join(',')}`)
}

const increment = (key, value=1, tags, timestamp=Date.now()) => {
  tags = tags || []
  console.log(`MONITORING|${timestamp}|${value}|count|${key}|#${tags.join(',')}`)
}

const histogram = (key, value, tags, timestamp=Date.now()) => {
  tags = tags || []
  console.log(`MONITORING|${timestamp}|${value}|histogram|${key}|#${tags.join(',')}`)
}

const trackExecTime = (f, key, tags, timestamp=Date.now()) => {
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
  if (!res.hasOwnProperty('then')) {
    const end = new Date().getTime()
    histogram(key, end-start, tags, timestamp)
    return res
  } else {
    return res.then(x => {
      const end = new Date().getTime()
      histogram(key, end-start, tags, timestamp)
      return x
    })
  }
}

module.exports = {
  gauge,
  increment,
  histogram,
  trackExecTime
}