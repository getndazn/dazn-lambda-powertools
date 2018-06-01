const Metrics = require('../datadog-metrics-async')

const now = Date.now()
Date.now = jest.fn().mockReturnValue(now)

const consoleLog = jest.spyOn(global.console, 'log')

beforeEach(consoleLog.mockReset)

afterAll(() => consoleLog.mockRestore())

const expectLogLike = regexPattern => {
  expect(consoleLog).toBeCalled()
  const [ output ] = consoleLog.mock.calls[0]
  expect(output).toMatch(new RegExp(regexPattern))
}

const run = (f, type) => {
  test(`When we run Metrics.${type}, it should be logged to console`, () => {
    f('test', 42)
    expectLogLike(`MONITORING\|${now}\|42\|${type}\|test\|#`)
  })

  test(`When we run Metrics.${type} with tags, the tags should be logged`, () => {
    f('test', 42, [ 'happy', 'sad:false' ])
    expectLogLike(`MONITORING\|${now}\|42\|${type}\|test\|#happy,sad:false`)
  })

  test(`When we run Metrics.${type} with timestamp, it should be logged instead of current timestamp`, () => {
    f('test', 42, null, 1234567890123)
    expectLogLike(`MONITORING\|1234567890123\|42\|${type}\|test\|#`)
  })

  test(`When we run Metrics.${type} with both tags and timestamp, both should be logged`, () => {
    f('test', 42, [ 'happy', 'sad:false' ], 1234567890123)
    expectLogLike(`MONITORING\|1234567890123\|42\|${type}\|test\|#happy,sad:false`)
  })
}

describe('async client', () => {
  run(Metrics.gauge, 'gauge')
  run(Metrics.increment, 'count')
  run(Metrics.histogram, 'histogram')
})