/**
 * Filtering modes this library currently supports
 */
const FILTERING_MODE = Object.freeze({ 'BLACKLIST': 'BLACKLIST', 'WHITELIST': 'WHITELIST' })
const OBFUSCATION_MASK = Object.freeze('******')

/**
 * Flattens given object recursively.
 * e.g. {f1:{f2:foo}, f3:[ {f4:bar}, {f5:bar} ]} will be flattened into {f1.f2: bar, f3.0.f4: bar, f3.1.f5: bar}.
 * @param {*} object Object to be flattened.
 * @param {*} pathPrefix Helper property to build property paths.
 * @returns flattened one-level-deep object.
 */
const flatten = (object, pathPrefix = '') => {
  return Object.keys(object).reduce((prev, property) => {
    if (object[property] && typeof object[property] === 'object' && !Array.isArray(property)) {
      return { ...prev, ...flatten(object[property], `${pathPrefix}${property}.`) }
    } else {
      return { ...prev, ...{ [`${pathPrefix}${property}`]: object[property] } }
    }
  }, {})
}

/**
 * Expands given flattened object into multi-level nested object.
 * e.g. {f1.f2: bar, f3.0.f4: bar, f3.1.f5: bar} will be expanded into {f1:{f2:foo}, f3:[ {f4:bar}, {f5:bar} ]}
 * @param {*} object Object to be expanded.
 * @returns expanded multi-level nested object.
 */

const unflatten = (object) => {
  var result = {}

  Object.keys(object).forEach(property => {
    var keys = property.split('.')
    keys.reduce((res, key, currentIdx) => {
      if (res[key]) { return res[key] }

      const nextKey = keys[currentIdx + 1]
      // is the following key an array index?
      if (isNaN(Number(nextKey))) {
        res[key] = (keys.length - 1 === currentIdx) ? object[property] : {}
      } else {
        res[key] = []
      }

      // continue processing one level deeper
      return res[key]
    }, result)
  })

  return result
}

/**
 * Returns a list of property names to be obfuscated
 * @param {*} flattenedEvent one-level-nested flat event to be processed
 * @param {*} filters paths to be processed depending on the filtering mode
 * @param {*} filteringMode either WHITELIST or BLACKLIST
 */
const getKeysToObfuscate = (flattenedEvent, filters, filteringMode) => {
  const filterRegexp = filters.map(f => toFilterRegex(f))
  return Object.keys(flattenedEvent).filter(key => {
    const normalizedKey = normalizeArrayIndices(key)
    // we allow filters to specify array indices, e.g. foo.1.bar
    let res = filterRegexp.some(filter => normalizedKey.match(filter) || key.match(filter))
    return (filteringMode === FILTERING_MODE.BLACKLIST) ? res : !res
  })
}

const applyObfuscation = (event, keys) => {
  keys.forEach(key => {
    event[key] = OBFUSCATION_MASK
  })
  return event
}

const toFilterRegex = (path) => {
  // excape special characters: foo.*.bar => foo\.\*\.bar
  // and extend the regex so that filter "foo.*.bar"
  // can match: foo.*.bar, foo.*.bar.extended, foo.*.bar.extended.*.witharray
  // but not  : foo.*.barbar, foo.*.barthiswordstartswithbar etc.
  return new RegExp(`^${path.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}((\\.[*\\w]+)*)$`)
}

const normalizeArrayIndices = (path) => {
  // foo.0.bar => foo.*.bar
  return path.replace(/\.\d+\./g, '.*.')
}

const obfuscate = (event, filters, filteringMode) => {
  if (!filters || !filteringMode || !Array.isArray(filters)) {
    return event
  }

  const flattenedEvent = flatten(event)
  const keysToObfuscate = getKeysToObfuscate(flattenedEvent, filters, filteringMode)
  const obfuscatedEvent = applyObfuscation(flattenedEvent, keysToObfuscate)

  return unflatten(obfuscatedEvent)
}

module.exports = {
  obfuscate,
  FILTERING_MODE
}
