const gauge = (key, value, tags=[], timestamp=Date.now()) => {
  console.log(`MONITORING|${timestamp}|${value}|gauge|${key}|#${tags.join(',')}`)
}

const increment = (key, value=1, tags=[], timestamp=Date.now()) => {
  console.log(`MONITORING|${timestamp}|${value}|count|${key}|#${tags.join(',')}`)
}

const histogram = (key, value, tags=[], timestamp=Date.now()) => {
  console.log(`MONITORING|${timestamp}|${value}|histogram|${key}|#${tags.join(',')}`)
}

module.exports = {
  gauge,
  increment,
  histogram
}