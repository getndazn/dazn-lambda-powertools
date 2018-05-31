const Log = require('@perform/lambda-powertools-logger')

function create (refresh, refreshFreqMs) {
  let value, expiration

  let getValue = async () => {
    let now = new Date()
    if (!value || expiration < now) {
      try {
        value = await refresh()
        expiration = new Date(now.getTime() + refreshFreqMs)
        Log.debug(`cache has been refreshed`, { expiration })
      } catch (err) {
        // only rethrow if this is first request and we don't have a cached value yet
        if (value) {
          expiration = new Date(now.getTime() + refreshFreqMs)
          Log.warn(`failed to refresh cache, using existing cached value`, { expiration }, err)          
        } else {
          Log.error('failed to get initial value', null, err)
          throw err
        }
      }
    }

    return value
  }

  let activeSerivce = {
    get value() { return getValue() }
  }

  return activeSerivce
}

module.exports = {
  create
}