function create (refresh, refreshFreqMs) {
  let value, expiration

  let getValue = co.wrap(function* () {
    let now = new Date()
    if (!value || expiration < now) {
      try {
        value = yield refresh()
        expiration = new Date(now.getTime() + refreshFreqMs)
      } catch (err) {
        // only rethrow if this is first request and we don't have a cached value yet
        if (!value) {
          throw err
        }
      }
    }

    return value
  })

  let activeSerivce = {
    get value() { return getValue() }
  }

  return activeSerivce
}

module.exports = {
  create
}