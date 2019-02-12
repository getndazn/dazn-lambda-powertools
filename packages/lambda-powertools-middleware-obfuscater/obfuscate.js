const { flow, map, filter, isUndefined, toString, reduce, forEach, get, merge } = require("lodash/fp");

const obfuscateStringField = key => ({ [key]: '******' });

const mapChildren = field => key => {
  const newField = get(key)(field);

  if (newField instanceof Array) {
    return { [key]: map(mapObject)(newField) };
  }

  if (newField instanceof Object) {
    return { [key]: mapObject(newField) };
  }

  return obfuscateStringField(key);
};

const mapObject = field => {
  return flow(
    map(mapChildren(field)),
    reduce((prev, curr) => ({ ...prev, ...curr }), {})
  )(Object.keys(field));
};

const mapArray = (key, field) => {
  return flow(
    map(field => getField(field)(key)),
    filter(field => !isUndefined(field)),
    map(field => mapObfuscate(field))
  )(field);
};

const mapObfuscate = tuple => {
  const objectKey = Object.keys(tuple)[0];
  const field = get(objectKey)(tuple);

  if (field instanceof Array) {
    const startPoint = objectKey.indexOf(".*.");
    const newKey = objectKey.substr(startPoint + 3, objectKey.length);
    const oldKey = objectKey.substr(0, startPoint);
    console.log(oldKey);
    console.log(newKey);
    return convertToObject(oldKey, mapArray(newKey, field));
  }

  if (field instanceof Object) {
    return { [objectKey]: mapObject(field) };
  }

  return obfuscateStringField(objectKey);
};

const getField = event => fieldName => {
  const indexOfArray = fieldName.indexOf(".*.");
  const earliestField =
    indexOfArray > -1 ? fieldName.substr(0, indexOfArray) : fieldName;
  const field = get(earliestField)(event);
  return field && { [fieldName]: field };
};

const convertToObject = (fieldName, field) => {
  const split = fieldName.split(".");
  const object = {};
  let pointer = object;
  for (let index = 0; index < split.length; index++) {
    const key = split[index];
    pointer[key] = index !== split.length - 1 && {} || field;
    pointer = pointer[key];
  }

  return object;
};

const reduceToObfuscatedEvent = event => (prev, curr) => {
  forEach(fieldName => {
    const field = get(fieldName)(curr) || get(fieldName)(event);
    if (field) {
      prev = { ...prev, ...{ [fieldName]: field } };
    }
  })(Object.keys(curr));

  return prev;
};

module.exports = (event, fieldsToObfuscate) => {
  const obfuscatedObject = flow(
    map(getField(event)),
    filter(field => !isUndefined(field)),
    map(mapObfuscate),
    reduce(reduceToObfuscatedEvent(event), {})
  )(fieldsToObfuscate);

  return merge(event, obfuscatedObject)
};
