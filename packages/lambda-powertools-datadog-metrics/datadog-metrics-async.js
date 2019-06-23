let defaultTags = []; let isInitialized = false; let prefix

function init () {
  if (isInitialized) {
    return
  }

  prefix = process.env.DATADOG_PREFIX || ''
  if (process.env.DATADOG_TAGS) {
    defaultTags = process.env.DATADOG_TAGS.split(',').map(x => x.trim()).filter(x => x)
  }

  isInitialized = true
}

const gauge = (key, value, tags, timestamp = Date.now()) => {
  init()

  key = prefix + key
  tags = defaultTags.concat(tags || [])
  console.log(`MONITORING|${timestamp}|${value}|gauge|${key}|#${tags.join(',')}`)
}

const increment = (key, value = 1, tags, timestamp = Date.now()) => {
  init()

  key = prefix + key
  tags = defaultTags.concat(tags || [])
  console.log(`MONITORING|${timestamp}|${value}|count|${key}|#${tags.join(',')}`)
}

const histogram = (key, value, tags, timestamp = Date.now()) => {
  init()

  key = prefix + key
  tags = defaultTags.concat(tags || [])
  console.log(`MONITORING|${timestamp}|${value}|histogram|${key}|#${tags.join(',')}`)
}

const distribution = (key, value, tags, timestamp = Date.now()) => {
  init()

  key = prefix + key
  tags = defaultTags.concat(tags || [])
  console.log(`MONITORING|${timestamp}|${value}|distribution|${key}|#${tags.join(',')}`)
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
