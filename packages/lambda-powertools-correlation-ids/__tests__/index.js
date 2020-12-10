const CorrelationIds = require('../index')

global.console.debug = jest.fn()
global.console.info = jest.fn()
global.console.warn = jest.fn()
global.console.error = jest.fn()

const suite = (correlationIds) => () => {
  afterEach(correlationIds.clearAll)
  describe('.set', () => {
    describe('when the key is missing x-correlation- prefix', () => {
      beforeEach(() => {
        correlationIds.set('id', 'test')
      })
      it('adds the prefix', () => {
        expect(correlationIds.get()).toEqual({
          'x-correlation-id': 'test'
        })
      })
    })

    describe('when the key has x-correlation-prefix', () => {
      beforeEach(() => {
        correlationIds.set('x-correlation-id', 'test')
      })
      it('sets it as is', () => {
        expect(correlationIds.get()).toEqual({
          'x-correlation-id': 'test'
        })
      })
    })

    describe('when setting twice', () => {
      beforeEach(() => {
        correlationIds.set('x-correlation-id', 'hello')
        correlationIds.set('x-correlation-id', 'world')
      })
      it('overrides the previous value', () => {
        expect(correlationIds.get()).toEqual({
          'x-correlation-id': 'world'
        })
      })
    })
  })

  describe('get/set debug logging', () => {
    it('GETS and SETS state of debug logging', () => {
      correlationIds.clearAll()
      expect(correlationIds.debugLoggingEnabled).toBe(false)
      correlationIds.debugLoggingEnabled = true
      expect(correlationIds.debugLoggingEnabled).toBe(true)
      expect(correlationIds.get()).toEqual({
        'debug-log-enabled': 'true'
      })
    })
  })

  describe('.replaceAllWith', () => {
    beforeEach(() => {
      correlationIds.set('x-correlation-id', 'this should be replaced')
      correlationIds.set('x-correlation-user-id', 'this should be removed')
    })
    it('replaces all existing IDs', () => {
      correlationIds.replaceAllWith({
        'x-correlation-id': 'id',
        'x-correlation-order-id': 'order'
      })

      const ids = correlationIds.get()
      expect(ids).toHaveProperty('x-correlation-id')
      expect(ids['x-correlation-id']).toBe('id')
      expect(ids).not.toHaveProperty('x-correlation-user-id')
      expect(ids).toHaveProperty('x-correlation-order-id')
      expect(ids['x-correlation-order-id']).toBe('order')
    })
  })

  describe('.clearAll', () => {
    it('removes all correlation IDs', () => {
      correlationIds.set('x-correlation-id', 'this should be removed')

      correlationIds.clearAll()

      const ids = correlationIds.get()
      expect(ids).toEqual({})
    })
  })
}

describe('CorrelationIds (global)', suite(CorrelationIds))
describe('CorrelationIds (child)', suite(new CorrelationIds()))

describe('Global references', () => {
  it('stores a reference to the global instance as a global', () => {
    expect(global.CORRELATION_IDS).toBeInstanceOf(CorrelationIds)
  })

  describe('when re-requiring correlationIds', () => {
    let NewCorrelationIds
    beforeEach(() => {
      CorrelationIds.set('testing', 'true')
      jest.resetModules()
      NewCorrelationIds = require('../index')
    })

    it('shares the same global instance', () => {
      expect(NewCorrelationIds).not.toBe(CorrelationIds)

      expect(NewCorrelationIds.get()).toEqual({
        'x-correlation-testing': 'true'
      })
    })
  })
})
