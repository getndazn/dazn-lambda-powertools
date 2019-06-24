const csvToKeyValuesArray = csv =>
  csv.split(',').filter(x => x).map(pair => pair.split(':'))

const keyValuesArrayToCsv = pairs =>
  pairs.map(x => x.join(':')).join(',')

const combineUniqueKeyValueArray = (original, additional) =>
  Array.from(new Map([...original, ...additional]))

const supplementCsv = ({ existing = '', additional = '' } = {}) => {
  // parameters will be in the format '<key1>:<value1>,<key2>:<value2>'
  // Map requires as [[key1, value1], [key2, value2]]
  const existingNormalised = csvToKeyValuesArray(existing)
  const additionalNormalised = csvToKeyValuesArray(additional)

  // Assigning to a map to stop any duplicates keys (existing taking precedence)
  const allTags = combineUniqueKeyValueArray(additionalNormalised, existingNormalised)

  // convert back to original csv format
  return keyValuesArrayToCsv(allTags)
}

module.exports = supplementCsv
