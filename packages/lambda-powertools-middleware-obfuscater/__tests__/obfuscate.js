const obfuscater = require('../obfuscate')

const invokeObfuscater = (event, obfuscationFilters = []) => {
  return obfuscater(event, obfuscationFilters)
}

test('should obfuscate events using the filter', () => {
  const event = invokeObfuscater({ test: 'wat' }, ['test'])
  expect(event.test).toEqual('******')
})

test('should obfuscate events with arrays using the filter', () => {
  const event = invokeObfuscater({ test: [{ foo: 'wat' }, { foo: 'bar' }] }, [
    'test.*.foo'
  ])
  expect(event.test[0].foo).toEqual('******')
  expect(event.test[1].foo).toEqual('******')
})

test('should obfuscate events with multipleArrays arrays using the filter', () => {
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

test('should obfuscate every field on an object using the filter', () => {
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

test('should not filter fields that dont exist', () => {
  const rawEvent = { test: { foo: { bar: { buzz: 'Nope' } } } }
  const event = invokeObfuscater({ test: { foo: { bar: { buzz: 'Nope' } } } }, [
    'test.foo.bar.boop'
  ])
  expect(event).toEqual(rawEvent)
})

test('should not filter fields that dont exist with arrays', () => {
  const event = { test: { foo: { bar: [{ buzz: 'Nope' }] } } }
  const obfuscatedEvent = invokeObfuscater(
    { test: { foo: { bar: [{ buzz: 'Nope' }] } } },
    ['test.foo.bar.*.blap']
  )

  expect(event).toEqual(obfuscatedEvent)
})

test('should not filter when nothing passed', () => {
  const event = { test: { foo: { bar: [{ buzz: 'Nope' }] } } }
  const obfuscatedEvent = invokeObfuscater(
    { test: { foo: { bar: [{ buzz: 'Nope' }] } } },
    []
  )

  expect(event).toEqual(obfuscatedEvent)
})

test('should not filter when object doesnt exist', () => {
  const event = { test: { foo: { bar: [{ buzz: 'Nope' }] } } }
  const obfuscatedEvent = invokeObfuscater(event, ['empty'])
  expect(event).toEqual(obfuscatedEvent)
})

test('should obfuscate objects when it exists in one object in an array, but not others', () => {
  const event = { test: [{ foo: 'Bar', Baz: 'Boop' }, { foo: 'Bar' }] }
  const obfuscatedEvent = invokeObfuscater(event, ['test.*.Baz'])
  expect(obfuscatedEvent.test[0].Baz).toEqual('******')
  expect(obfuscatedEvent.test[1].Baz).toBeUndefined()
})
