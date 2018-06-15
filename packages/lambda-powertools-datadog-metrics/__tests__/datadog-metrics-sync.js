jest.doMock('datadog-metrics')

const Datadog = require('datadog-metrics')
Datadog.gauge = jest.fn()
Datadog.increment = jest.fn()
Datadog.histogram = jest.fn()

const Metrics = require('../datadog-metrics-sync')

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
  beforeEach(Datadog.histogram.mockClear)

  test('Metrics.trackExecTime should record execution time of synchronous functions', () => {
    const start = Date.now()
    const f = () => {
      let timeSinceStart = 0
      do {
        timeSinceStart = Date.now() - start
      } while (timeSinceStart < 10)

      return 42
    }
    
    const key = 'Metrics.trackExecTime.sync'
    const answer = Metrics.trackExecTime(f, key)
  
    expect(answer).toBe(42)
    expect(Datadog.histogram).toBeCalled()
    const [ actualKey, value, tags, timestamp ] = Datadog.histogram.mock.calls[0]
    expect(actualKey).toBe(key)
    expect(value).toBeGreaterThanOrEqual(10)
    expect(tags).toEqual([])
    expect(timestamp).toBeGreaterThanOrEqual(start + 10)
  })
  
  test('Metrics.trackExecTime should record execution time of asynchronous functions', async () => {
    const start = Date.now()
    const f = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(42), 10)
      })
    }
  
    const key = 'Metrics.trackExecTime.async'
    const answer = await Metrics.trackExecTime(f, key)
  
    expect(answer).toBe(42)
    expect(Datadog.histogram).toBeCalled()
    const [ actualKey, value, tags, timestamp ] = Datadog.histogram.mock.calls[0]
    expect(actualKey).toBe(key)
    expect(value).toBeGreaterThanOrEqual(10)
    expect(tags).toEqual([])
    expect(timestamp).toBeGreaterThanOrEqual(start + 10)
  })
})