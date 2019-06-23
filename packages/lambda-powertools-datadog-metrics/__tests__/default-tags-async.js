const consoleLog = jest.spyOn(global.console, 'log')

// should map to 2 default tags only, the empty ones are dropped
process.env.DATADOG_TAGS = 'jest,   , env:test ,'
const defaultTags = 'jest,env:test'

beforeEach(consoleLog.mockReset)

afterAll(() => {
  consoleLog.mockRestore()
  delete process.env.DATADOG_TAGS
})

const expectLogLike = regexPattern => {
  expect(consoleLog).toBeCalled()
  const [ output ] = consoleLog.mock.calls[0]
  expect(output).toMatch(regexPattern)
}

const Metrics = require('../datadog-metrics-async')

const run = (f, type) => {
  const now = Date.now()

  test(`When we run Metrics.${type}, it should be logged to console`, () => {
    f('test', 42)
    expectLogLike(`MONITORING|${now}|42|${type}|test|#${defaultTags}`)
  })

  test(`When we run Metrics.${type} with tags, the tags should be logged`, () => {
    f('test', 42, [ 'happy', 'sad:false' ])
    expectLogLike(`MONITORING|${now}|42|${type}|test|#${defaultTags},happy,sad:false`)
  })

  test(`When we run Metrics.${type} with timestamp, it should be logged instead of current timestamp`, () => {
    f('test', 42, null, 1234567890123)
    expectLogLike(`MONITORING|1234567890123|42|${type}|test|#${defaultTags}`)
  })

  test(`When we run Metrics.${type} with both tags and timestamp, both should be logged`, () => {
    f('test', 42, [ 'happy', 'sad:false' ], 1234567890123)
    expectLogLike(`MONITORING|1234567890123|42|${type}|test|#${defaultTags},happy,sad:false`)
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
})
