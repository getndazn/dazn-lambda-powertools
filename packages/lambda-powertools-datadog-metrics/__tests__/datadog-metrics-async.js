const Metrics = require('../datadog-metrics-async')

const consoleLog = jest.spyOn(global.console, 'log')

beforeEach(consoleLog.mockReset)

afterAll(() => consoleLog.mockRestore())

const expectLogLike = regexPattern => {
  expect(consoleLog).toBeCalled()
  const [ output ] = consoleLog.mock.calls[0]
  expect(output).toMatch(regexPattern)
}

const run = (f, type) => {
  const now = Date.now()

  test(`When we run Metrics.${type}, it should be logged to console`, () => {
    f('test', 42)
    expectLogLike(`MONITORING|${now}|42|${type}|test|#`)
  })

  test(`When we run Metrics.${type} with tags, the tags should be logged`, () => {
    f('test', 42, [ 'happy', 'sad:false' ])
    expectLogLike(`MONITORING|${now}|42|${type}|test|#happy,sad:false`)
  })

  test(`When we run Metrics.${type} with timestamp, it should be logged instead of current timestamp`, () => {
    f('test', 42, null, 1234567890123)
    expectLogLike(`MONITORING|1234567890123|42|${type}|test|#`)
  })

  test(`When we run Metrics.${type} with both tags and timestamp, both should be logged`, () => {
    f('test', 42, [ 'happy', 'sad:false' ], 1234567890123)
    expectLogLike(`MONITORING|1234567890123|42|${type}|test|#happy,sad:false`)
  })
}

describe('async client', () => {
  const now = Date.now()
  const DateNow = Date.now
  Date.now = jest.fn().mockReturnValue(now)

  afterAll(() => {
    Date.now = DateNow
  })

  run(Metrics.gauge, 'gauge')
  run(Metrics.increment, 'count')
  run(Metrics.histogram, 'histogram')
  run(Metrics.distribution, 'distribution')
})

// broken this out to be a separate describe as we can't mock `Date.now()` here
// otherwise it won't give us the duration of the function
describe('async client trackExecTime', () => {
  const DateNow = Date.now

  const startDate = 1561300140521
  const endDate = startDate + 10

  beforeEach(() => {
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
    expectLogLike(`MONITORING|${endDate}|10|histogram|${key}|#`)
  })

  test('Metrics.trackExecTime should record execution time of asynchronous functions', async () => {
    const f = async () => 42

    const key = 'Metrics.trackExecTime.async'
    const answer = await Metrics.trackExecTime(f, key)

    expect(answer).toBe(42)
    expectLogLike(`MONITORING|${endDate}|10|histogram|${key}|#`)
  })

  test('Metrics.trackExecTime should not swallow exceptions from synchronous functions', () => {
    const f = () => {
      throw new Error('oops')
    }

    const key = 'Metrics.trackExecTime.sync'
    expect(() => Metrics.trackExecTime(f, key)).toThrow()
  })

  test('Metrics.trackExecTime should not swallow exceptions from asynchronous functions', async () => {
    const f = async () => {
      throw new Error('oops')
    }

    const key = 'Metrics.trackExecTime.sync'

    // eslint-disable-next-line no-unused-expressions
    expect(Metrics.trackExecTime(f, key)).rejects
  })
})
