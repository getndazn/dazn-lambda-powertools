// These tests are put aside in a separate file because the presense of correlation IDs
// might affect other tests. Rather than carefully plan around when to clear them, etc.
// I thought it'd be easier to just isolate them

const CorrleationIds = require('@perform/lambda-powertools-correlation-ids')
const Log = require('../index')

CorrleationIds.set('id', '42')
CorrleationIds.set('name', 'theburningmonk')

const consoleLog = jest.spyOn(global.console, 'log')

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

test('Correlation IDs are included in debug logs', () => correlationIdsAreIncluded(Log.debug))
test('Correlation IDs are included in info logs', () => correlationIdsAreIncluded(Log.info))
test('Correlation IDs are included in warn logs', () => correlationIdsAreIncluded(Log.warn))
test('Correlation IDs are included in error logs', () => correlationIdsAreIncluded(Log.error))

test('Params override correlation IDs in debug logs', () => paramsOverrideCorrelationIds(Log.debug))
test('Params override correlation IDs in info logs', () => paramsOverrideCorrelationIds(Log.info))
test('Params override correlation IDs in warn logs', () => paramsOverrideCorrelationIds(Log.warn))
test('Params override correlation IDs in error logs', () => paramsOverrideCorrelationIds(Log.error))
