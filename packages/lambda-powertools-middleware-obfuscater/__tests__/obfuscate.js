const obfuscater = require('../obfuscate')

const invokeObfuscater = (event, obfuscationFilters = []) => {
  return obfuscater(event, obfuscationFilters)
}

describe('Obfuscater middleware', () => {
  it('should obfuscate events using the filter', () => {
    const event = invokeObfuscater({ test: 'wat' }, ['test'])
    expect(event.test).toEqual('******')
  })

  it('should obfuscate events with arrays using the filter', () => {
    const event = invokeObfuscater({ test: [{ foo: 'wat' }, { foo: 'bar' }] }, [
      'test.*.foo'
    ])
    expect(event.test[0].foo).toEqual('******')
    expect(event.test[1].foo).toEqual('******')
  })

  it('should obfuscate events with multipleArrays arrays using the filter', () => {
    const event = invokeObfuscater(
      {
        test: [
          { foo: { bar: [{ baz: 'heyo' }] } },
          { foo: { bar: [{ baz: 'hey' }] } }
        ]
      },
      ['test.*.foo.bar.*.baz']
    )
    expect(event.test[0].foo.bar[0].baz).toEqual('******')
  })

  it('should obfuscate every field on an object using the filter', () => {
    const event = invokeObfuscater(
      {
        test: [
          { foo: { bar: [{ baz: { bloop: { blah: 'Please Obfuscate Me' } } }] } },
          { foo: { bar: [{ baz: 'hey' }] } }
        ]
      },
      ['test.*.foo']
    )
    expect(event.test[0].foo.bar[0].baz.bloop.blah).toEqual('******')
  })

  it('should not filter fields that dont exist', () => {
    const rawEvent = { test: { foo: { bar: { buzz: 'Nope' } } } }
    const event = invokeObfuscater({ test: { foo: { bar: { buzz: 'Nope' } } } }, [
      'test.foo.bar.boop'
    ])
    expect(event).toEqual(rawEvent)
  })

  it('should not filter fields that dont exist with arrays', () => {
    const event = { test: { foo: { bar: [{ buzz: 'Nope' }] } } }
    const obfuscatedEvent = invokeObfuscater(
      { test: { foo: { bar: [{ buzz: 'Nope' }] } } },
      ['test.foo.bar.*.blap']
    )

    expect(event).toEqual(obfuscatedEvent)
  })

  describe('when nothing is passed', () => {
    it('should not filter', () => {
      const event = { test: { foo: { bar: [{ buzz: 'Nope' }] } } }
      const obfuscatedEvent = invokeObfuscater(
        { test: { foo: { bar: [{ buzz: 'Nope' }] } } },
        []
      )

      expect(event).toEqual(obfuscatedEvent)
    })
  })

  describe('when object doesnt exist', () => {
    it('should not filter', () => {
      const event = { test: { foo: { bar: [{ buzz: 'Nope' }] } } }
      const obfuscatedEvent = invokeObfuscater(event, ['empty'])
      expect(event).toEqual(obfuscatedEvent)
    })
  })

  describe('when object exists in one item in an array but not others', () => {
    it('should obfuscate that object', () => {
      const event = { test: [{ foo: 'Bar', Baz: 'Boop' }, { foo: 'Bar' }] }
      const obfuscatedEvent = invokeObfuscater(event, ['test.*.Baz'])
      expect(obfuscatedEvent.test[0].Baz).toEqual('******')
      expect(obfuscatedEvent.test[1].Baz).toBeUndefined()
      expect(obfuscatedEvent.test[1].foo).toEqual('Bar')
    })
  })

  it('should obfuscate representative examples', () => {
    const event = require('./fixture/fixture.json')
    const expectedOutcome = require('./fixture/expected.json')
    const converted = invokeObfuscater(event, [
      'Records.*.dynamodb.NewImage.firstName',
      'Records.*.dynamodb.NewImage.lastName',
      'Records.*.dynamodb.NewImage.email',
      'Records.*.dynamodb.NewImage.ipAddress',
      'Records.*.dynamodb.OldImage.firstName',
      'Records.*.dynamodb.OldImage.lastName',
      'Records.*.dynamodb.OldImage.email',
      'Records.*.dynamodb.OldImage.ipAddress'
    ])

    expect(converted).toEqual(expectedOutcome)
  })
})
