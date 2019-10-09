// Given a CSV in form 'key1:value1,key2:value2:subValue2,value3,...,keyn:valuen, valuem'
// will extract the key value pairs and values:
// {
//   keyValues: { key1: 'value1', key2: 'value2:subValue2', ..., keyn: 'valuen'},
//   values: ['value3', ..., 'valuem']
// }
const extractFromCsv = csv =>
  csv.split(',').reduce((acc, item) => {
    const parts = item.split(':')

    if (parts.length > 1) {
      const [key, ...values] = parts
      acc.keyValues.push([key, values.join(':')])
    } else {
      acc.values.push(item)
    }

    return acc
  }, { keyValues: [], values: [] })

const combineKeyValuePair = pair => pair.join(':')

// Given keyValues of the form { key1: 'value1', key2: 'value2:subValue2', ..., keyn: 'valuen'}
// and values of form ['value3', ..., 'valuem']
// will combine back to csv of form 'key1:value1,key2:value2:subValue2,value3,...,keyn:valuen,valuem'
const buildCsv = ({ keyValues, values }) =>
  [
    ...keyValues.map(combineKeyValuePair),
    ...values
  ]
    .filter(x => x) // Either keyValues or values could be []
    .join(',')

// Combines two arrays in format [[key1, value1], [key2, value2], ..., [keyn, valuen]]
// Ensures that existing has precedence over additional WRT key name clashes
const combineUniqueKeyValueArray = (existing, additional) =>
  Array.from(new Map([...additional, ...existing]))

const supplementCsv = ({ existing = '', additional = {} } = {}) => {
  // parameters will be in the format '<key1>:<value1>,<key2>:<value2>'
  // Map requires as [[key1, value1], [key2, value2]]
  const { keyValues, values } = extractFromCsv(existing)
  const additionalNormalised = Object.entries(additional)

  // Assigning to a map to stop any duplicates keys (existing taking precedence)
  const allTags = combineUniqueKeyValueArray(keyValues, additionalNormalised)

  // convert back to original csv format but DOES NOT make any guarantees about order
  return buildCsv({ keyValues: allTags, values })
}

module.exports = supplementCsv
