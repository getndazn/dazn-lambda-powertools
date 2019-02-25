const _ = require('lodash/fp')

function convertToObfuscatedEvent (event, fieldsToObfuscate) {
  return _.flow(
    _.map(getUnobfuscatedObject(event)), // Retrieve the path to the object to obfuscate { a.b.c.**** }
    _.map(obfuscate), // Iterate through everything
    _.mergeAll, // Merge them all together creating one unified element
    removeEmptyObjects, // If any have returned an empty object, remove them as they are to be ignored
    _.merge(event) // Deep merge the event and obfuscated event together
  )(fieldsToObfuscate)
}

// returns the object from the fieldName
const getUnobfuscatedObject = event => fieldName => {
  const split = fieldName.split('.') || [fieldName]

  let object = {}
  let eventPointer = event
  let pointer = object
  for (let index = 0; index < split.length; index++) {
    const element = split[index]

    if (element === '*') {
      const newFieldName = split.slice(index + 1).join('.')
      const oldFieldName = split.slice(0, index).join('.')
      // we've hit an array, so recurse into this and return { a: { b: [{c: "****"}]}}
      return _.set(oldFieldName, _.map(arrayVal => getUnobfuscatedObject(arrayVal)(newFieldName))(eventPointer), object)
    }

    eventPointer = _.get(element)(eventPointer)
    // If it's not an array we just build up the object more until the last one where we replace it with the object in the event
    pointer[element] = (index !== split.length - 1 && {}) || eventPointer
    pointer = pointer[element]
  }

  // Return the minimal path to the object { a.b.c.d.obfuscation }
  return object
}

const obfuscate = field => {
  return _.flow(
    _.map(obfuscateChildren(field)),
    _.mergeAll
  )(Object.keys(field))
}

const obfuscateChildren = field => key => {
  const newField = _.get(key)(field)

  if (!_.isUndefined(newField)) {
    if (newField instanceof Array) {
      return { [key]: _.map(obfuscate)(newField) }
    }

    if (newField instanceof Object) {
      return { [key]: obfuscate(newField) }
    }

    return ({ [key]: '******' })
  }
}

const removeEmptyObjects = (object) => {
  return (function remove (obj) {
    for (var key in obj) {
      if (obj[key] && typeof obj[key] === 'object') {
        remove(obj[key]) // Recurse down finding the children nodes and removing them if needed
        if (_.size(obj[key]) === 0) {
          delete obj[key] // Remove the cloned elements empty child
        }
      }
    }

    return obj // Return the cloned modified object.
  })(_.cloneDeep(object)) // Clone so as to not modify the original item
}

module.exports = convertToObfuscatedEvent
