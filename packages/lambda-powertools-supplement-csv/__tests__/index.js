const supplementCsv = require('../index')

describe('supplement csv', () => {
  describe('when there are no existing items defined', () => {
    it('should return blank string when nothing to add', () => {
      const expected = ''

      const actual = supplementCsv()

      expect(actual).toEqual(expected)
    })

    it('should return csv string of key value pairs provided', () => {
      const expected = 'key1:value1,key2:value2,key3:value3'
      const inputs = {
        additional: {
          key1: 'value1',
          key2: 'value2',
          key3: 'value3'
        }
      }

      const actual = supplementCsv(inputs)

      expect(actual).toEqual(expected)
    })
  })

  describe('when there are no items to add', () => {
    it('should return existing csv string', () => {
      const expected = 'key1:value1,key2:value2,key3:value3'
      const inputs = {
        existing: 'key1:value1,key2:value2,key3:value3'
      }

      const actual = supplementCsv(inputs)

      expect(actual).toEqual(expected)
    })
  })

  describe('when there is an existing csv string', () => {
    it('should supplement with items to add', () => {
      const expected = [
        'key1:value1',
        'key2:value2',
        'key3:value3',
        'key4:value4',
        'key5:value5',
        'key6:value6'
      ]

      const inputs = {
        existing: 'key1:value1,key2:value2,key3:value3',
        additional: {
          key4: 'value4',
          key5: 'value5',
          key6: 'value6'
        }
      }

      const actual = supplementCsv(inputs)

      expected.forEach(value =>
        expect(actual).toEqual(expect.stringContaining(value))
      )
    })

    it('should not overwrite existing keys with items to add', () => {
      const expected = [
        'key1:value1',
        'key2:value2',
        'key3:value3',
        'key5:value5',
        'key6:value6'
      ]

      const inputs = {
        existing: 'key1:value1,key2:value2,key3:value3',
        additional: {
          key1: 'newValue1',
          key5: 'value5',
          key6: 'value6'
        }
      }

      const actual = supplementCsv(inputs)

      expected.forEach(value =>
        expect(actual).toEqual(expect.stringContaining(value))
      )
    })

    it('should allow values that include a colon', () => {
      const expected = [
        'key1:value1:subValue1',
        'key2:value2',
        'key3:value3',
        'key5:value5',
        'key6:value6'
      ]
      const inputs = {
        existing: 'key1:value1:subValue1,key2:value2,key3:value3',
        additional: {
          key1: 'newValue1',
          key5: 'value5',
          key6: 'value6'
        }
      }

      const actual = supplementCsv(inputs)

      expected.forEach(value =>
        expect(actual).toEqual(expect.stringContaining(value))
      )
    })

    it('should allow values with no key', () => {
      const expected = [
        'value1',
        'key2:value2',
        'key3:value3',
        'key5:value5',
        'key6:value6'
      ]

      const inputs = {
        existing: 'value1,key2:value2,key3:value3',
        additional: {
          key5: 'value5',
          key6: 'value6'
        }
      }

      const actual = supplementCsv(inputs)

      expected.forEach(value =>
        expect(actual).toEqual(expect.stringContaining(value))
      )
    })
  })
})
