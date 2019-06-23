jest.doMock('datadog-metrics')

const Datadog = require('datadog-metrics')
Datadog.gauge = jest.fn()
Datadog.increment = jest.fn()
Datadog.histogram = jest.fn()

process.env.DATADOG_API_KEY = 'test'
let Metrics = require('../datadog-metrics-sync')

const run = (f, mock, type) => {
  const now = Date.now()

  test(`When we run Metrics.${type}, it should be forwarded on`, () => {
    const key = `Metrics.${type}.1`
    f(key, 42)
    expect(mock).toBeCalledWith(key, 42, [], now)
  })

  test(`When we run Metrics.${type} with tags, the tags should be logged`, () => {
    const key = `Metrics.${type}.2`
    f(key, 42, [ 'happy', 'sad:false' ])
    expect(mock).toBeCalledWith(key, 42, [ 'happy', 'sad:false' ], now)
  })

  test(`When we run Metrics.${type} with timestamp, it should be logged instead of current timestamp`, () => {
    const key = `Metrics.${type}.3`
    f(key, 42, null, 1234567890123)
    expect(mock).toBeCalledWith(key, 42, [], 1234567890123)
  })

  test(`When we run Metrics.${type} with both tags and timestamp, both should be logged`, () => {
    const key = `Metrics.${type}.1`
    f(key, 42, [ 'happy', 'sad:false' ], 1234567890123)
    expect(mock).toBeCalledWith(key, 42, [ 'happy', 'sad:false' ], 1234567890123)
  })
}

describe('sync client', () => {
  const now = Date.now()
  const DateNow = Date.now
  Date.now = jest.fn().mockReturnValue(now)

  beforeEach(() => {
    Datadog.gauge.mockClear()
    Datadog.increment.mockClear()
    Datadog.histogram.mockClear()
  })

  afterAll(() => {
    Date.now = DateNow
  })

  run(Metrics.gauge, Datadog.gauge, 'gauge')
  run(Metrics.increment, Datadog.increment, 'count')
  run(Metrics.histogram, Datadog.histogram, 'histogram')
})

// broken this out to be a separate describe as we can't mock `Date.now()` here
// otherwise it won't give us the duration of the function
describe('sync client trackExecTime', () => {
  const DateNow = Date.now
  const startDate = 1561300140521
  const endDate = startDate + 10

  beforeEach(() => {
    Datadog.histogram.mockClear()
    Date.now = jest.fn()
      .mockReturnValueOnce(startDate)
      .mockReturnValueOnce(endDate)
  })

  afterAll(() => {
    Date.now = DateNow
  })

  test('Metrics.trackExecTime should record execution time of synchronous functions', () => {
    const f = () => 42

    const key = 'Metrics.trackExecTime.sync'
    const answer = Metrics.trackExecTime(f, key)

    expect(answer).toBe(42)
    expect(Datadog.histogram).toBeCalled()
    const [ actualKey, value, tags, timestamp ] = Datadog.histogram.mock.calls[0]
    expect(actualKey).toBe(key)
    expect(tags).toEqual([])
    expect(timestamp).toBe(endDate)
    expect(value).toBe(10)
  })

  test('Metrics.trackExecTime should record execution time of asynchronous functions', async () => {
    const f = async () => 42

    const key = 'Metrics.trackExecTime.async'
    const answer = await Metrics.trackExecTime(f, key)

    expect(answer).toBe(42)
    expect(Datadog.histogram).toBeCalled()
    const [ actualKey, value, tags, timestamp ] = Datadog.histogram.mock.calls[0]
    expect(actualKey).toBe(key)
    expect(tags).toEqual([])
    expect(timestamp).toBe(endDate)
    expect(value).toBe(10)
  })

  test('Metrics.trackExecTime should not swallow exceptions from synchronous functions', () => {
    const f = () => {
      throw new Error('oops')
    }

    const key = 'Metrics.trackExecTime.async'
    expect(() => Metrics.trackExecTime(f, key)).toThrow()
  })

  test('Metrics.trackExecTime should not swallow exceptions from asynchronous functions', async () => {
    const f = async () => {
      throw new Error('oops')
    }

    const key = 'Metrics.trackExecTime.async'
    // eslint-disable-next-line no-unused-expressions
    expect(Metrics.trackExecTime(f, key)).rejects
  })
})
