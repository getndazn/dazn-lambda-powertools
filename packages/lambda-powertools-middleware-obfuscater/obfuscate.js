const {
  flow,
  map,
  filter,
  isUndefined,
  reduce,
  forEach,
  get,
  merge
} = require('lodash/fp')

function convertToObfuscatedEvent (event, fieldsToObfuscate) {
  const obfuscatedObject = flow(
    map(getTupleFromFilterToEventField(event)), // Retrieve an object {[Filter]: [Field]}
    filter(isDefined), // If nothing found in the event undefined is returned - filter these out.
    map(obfuscate), // Iterate recursively through the event obfuscating fields based on the filter
    reduce(reduceToObfuscatedEvent(event), {}) // Reduce back to one object so that we can merge
  )(fieldsToObfuscate)

  // Deep merge the event and obfuscation together - returning an obfuscated event
  return merge(event, obfuscatedObject)
}

// Returns an object in the form { [filter] : field}
const getTupleFromFilterToEventField = event => fieldName => {
  const indexOfArray = fieldName.indexOf('.*.')
  const earliestField =
    indexOfArray > -1 ? fieldName.substr(0, indexOfArray) : fieldName
  const field = get(earliestField)(event)
  return field && { [fieldName]: field }
}

// Converts filters like "a.b.c" to { a: { b: "c" } }
const convertStringReferenceToObject = (fieldName, field) => {
  const split = fieldName.split('.')
  const object = {}
  let pointer = object
  for (let index = 0; index < split.length; index++) {
    const key = split[index]
    pointer[key] = (index !== split.length - 1 && {}) || field
    pointer = pointer[key]
  }

  return object
}

const obfuscate = tuple => {
  const objectKey = Object.keys(tuple)[0]
  const field = get(objectKey)(tuple)

  if (field instanceof Array) {
    const startPoint = objectKey.indexOf('.*.')
    const newKey = objectKey.substr(startPoint + 3, objectKey.length)
    const oldKey = objectKey.substr(0, startPoint)
    return convertStringReferenceToObject(
      oldKey,
      obfuscateArray(newKey, field)
    )
  }

  if (field instanceof Object) {
    return { [objectKey]: obfuscateObject(field) }
  }

  return obfuscateStringField(objectKey)
}

// Iterate through each object in the array and obfuscate.
const obfuscateArray = (key, arr) => {
  return flow(
    map(field => getTupleFromFilterToEventField(field)(key)),
    filter(isDefined),
    map(obfuscate)
  )(arr)
}

const obfuscateObject = field => {
  return flow(
    map(obfuscateChildren(field)),
    reduce((prev, curr) => ({ ...prev, ...curr }), {})
  )(Object.keys(field))
}

const obfuscateChildren = field => key => {
  const newField = get(key)(field)

  if (newField instanceof Array) {
    return { [key]: map(obfuscateObject)(newField) }
  }

  if (newField instanceof Object) {
    return { [key]: obfuscateObject(newField) }
  }

  return obfuscateStringField(key)
}

const obfuscateStringField = key => ({ [key]: '******' })

const reduceToObfuscatedEvent = event => (prev, curr) => {
  forEach(fieldName => {
    const field = get(fieldName)(curr) || get(fieldName)(event)
    if (field) {
      prev = { ...prev, ...{ [fieldName]: field } }
    }
  })(Object.keys(curr))

  return prev
}

const isDefined = field => !isUndefined(field)

module.exports = convertToObfuscatedEvent
