const CorrelationIds = require('../index')

afterEach(CorrelationIds.clearAll)

test('The convention of "x-correlation-" is enforced', () => {
  CorrelationIds.set('id', 'test')

  const ids = CorrelationIds.get()
  expect(ids).not.toHaveProperty('id')
  expect(ids).toHaveProperty('x-correlation-id')
})

test('After adding a correlation ID I can get it back', () => {
  CorrelationIds.set('x-correlation-id', 'test')

  const ids = CorrelationIds.get()
  expect(ids).toHaveProperty('x-correlation-id')
  expect(ids['x-correlation-id']).toBe('test')
})

test('Setting a correlation ID twice would override the existing value', () => {
  CorrelationIds.set('x-correlation-id', 'hello')
  CorrelationIds.set('x-correlation-id', 'world')

  const ids = CorrelationIds.get()
  expect(ids).toHaveProperty('x-correlation-id')
  expect(ids['x-correlation-id']).toBe('world')
})

test('replaceAllWith would replace all existing correlation IDs', () => {
  CorrelationIds.set('x-correlation-id', 'this should be replaced')
  CorrelationIds.set('x-correlation-user-id', 'this should be removed')

  CorrelationIds.replaceAllWith({
    'x-correlation-id': 'id',
    'x-correlation-order-id': 'order'
  })

  const ids = CorrelationIds.get()
  expect(ids).toHaveProperty('x-correlation-id')
  expect(ids['x-correlation-id']).toBe('id')
  expect(ids).not.toHaveProperty('x-correlation-user-id')
  expect(ids).toHaveProperty('x-correlation-order-id')
  expect(ids['x-correlation-order-id']).toBe('order')
})

test('clear would clear all existing correlation IDs', () => {
  CorrelationIds.set('x-correlation-id', 'this should be removed')

  CorrelationIds.clearAll()

  const ids = CorrelationIds.get()
  expect(ids).toEqual({})
})
