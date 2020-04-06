// These tests are put aside in a separate file because the presense of correlation IDs
// might affect other tests. Rather than carefully plan around when to clear them, etc.
// I thought it'd be easier to just isolate them

const CorrelationIds = require('@dazn/lambda-powertools-correlation-ids')
const Log = require('../index')

CorrelationIds.set('id', '42')
CorrelationIds.set('name', 'theburningmonk')

const consoleLog = jest.fn()
global.console.debug = consoleLog
global.console.info = consoleLog
global.console.warn = consoleLog
global.console.error = consoleLog

beforeEach(consoleLog.mockReset)

afterAll(() => consoleLog.mockRestore())

const verify = (f) => {
  expect(consoleLog).toBeCalled()
  const log = JSON.parse(consoleLog.mock.calls[0])
  f(log)
}

const correlationIdsAreIncluded = log => {
  log('test')
  verify(x => {
    expect(x['x-correlation-id']).toBe('42')
    expect(x['x-correlation-name']).toBe('theburningmonk')
  })
}

const paramsOverrideCorrelationIds = log => {
  log('test', { 'x-correlation-name': 'you should see this instead' })
  verify(x => {
    expect(x['x-correlation-name']).toBe('you should see this instead')
  })
}

describe('Logger (correlationIds)', () => {
  it('includes Correlation IDs in debug logs', () => correlationIdsAreIncluded(Log.debug))
  it('includes Correlation IDs in info logs', () => correlationIdsAreIncluded(Log.info))
  it('includes Correlation IDs in warn logs', () => correlationIdsAreIncluded(Log.warn))
  it('includes Correlation IDs in error logs', () => correlationIdsAreIncluded(Log.error))

  describe('when params set correlation IDs', () => {
    it('overrides correlation IDs with params in debug logs', () => paramsOverrideCorrelationIds(Log.debug))
    it('overrides correlation IDs with params in info logs', () => paramsOverrideCorrelationIds(Log.info))
    it('overrides correlation IDs with params in warn logs', () => paramsOverrideCorrelationIds(Log.warn))
    it('overrides correlation IDs with params in error logs', () => paramsOverrideCorrelationIds(Log.error))
  })
})
