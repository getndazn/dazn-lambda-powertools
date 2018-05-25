let clearAll = () => global.CONTEXT = undefined

let replaceAllWith = ctx => global.CONTEXT = ctx

let set = (key, value) => {
  if (!key.startsWith("x-correlation-")) {
    key = "x-correlation-" + key
  }

  if (!global.CONTEXT) {
    global.CONTEXT = {}
  }

  global.CONTEXT[key] = value
};

let get = () => global.CONTEXT || {}

module.exports = {
  clearAll: clearAll,
  replaceAllWith: replaceAllWith,
  set: set,
  get: get
}