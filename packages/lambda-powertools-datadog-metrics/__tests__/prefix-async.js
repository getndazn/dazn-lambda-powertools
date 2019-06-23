const consoleLog = jest.spyOn(global.console, 'log')

const startDate = 1561300140521
const endDate = startDate + 10

process.env.DATADOG_PREFIX = 'dazn.'

beforeEach(() => {
  consoleLog.mockClear()
})

afterAll(() => {
  consoleLog.mockRestore()
  delete process.env.DATADOG_PREFIX
})

const expectLogLike = regexPattern => {
  expect(consoleLog).toBeCalled()
  const [ output ] = consoleLog.mock.calls[0]
  expect(output).toMatch(regexPattern)
}

const Metrics = require('../datadog-metrics-async')

const run = (f, type) => {
  test(`When we run Metrics.${type}, should be logged to console`, () => {
    f('test', 42)
    expectLogLike(`MONITORING|${startDate}|42|${type}|dazn.test|#`)
  })

  test(`When we run Metrics.${type} with tags, the tags should be logged`, () => {
    f('test', 42, [ 'happy', 'sad:false' ])
    expectLogLike(`MONITORING|${startDate}|42|${type}|dazn.test|#happy,sad:false`)
  })

  test(`When we run Metrics.${type} with timestamp, should be logged instead of current timestamp`, () => {
    f('test', 42, null, 1234567890123)
    expectLogLike(`MONITORING|1234567890123|42|${type}|dazn.test|#`)
  })

  test(`When we run Metrics.${type} with both tags and timestamp, should both be logged`, () => {
    f('test', 42, [ 'happy', 'sad:false' ], 1234567890123)
    expectLogLike(`MONITORING|1234567890123|42|${type}|dazn.test|#happy,sad:false`)
  })
}

describe('async client', () => {
  const DateNow = Date.now

  beforeEach(() => {
    Date.now = jest.fn()
      .mockReturnValueOnce(startDate)
      .mockReturnValueOnce(endDate)
  })

  afterAll(() => {
    Date.now = DateNow
  })

  run(Metrics.gauge, 'gauge')
  run(Metrics.increment, 'count')
  run(Metrics.histogram, 'histogram')
})

// broken this out to be a separate describe as we can't mock `Date.now()` here
// otherwise it won't give us the duration of the function
describe('async client trackExecTime', () => {
  const DateNow = Date.now

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
    expectLogLike(`MONITORING|${endDate}|10|histogram|dazn.${key}|#`)
  })

  test('Metrics.trackExecTime should record execution time of asynchronous functions', async () => {
    const f = async () => 42

    const key = 'Metrics.trackExecTime.async'
    const answer = await Metrics.trackExecTime(f, key)

    expect(answer).toBe(42)
    expectLogLike(`MONITORING|${endDate}|10|histogram|dazn.${key}|#`)
  })
})
