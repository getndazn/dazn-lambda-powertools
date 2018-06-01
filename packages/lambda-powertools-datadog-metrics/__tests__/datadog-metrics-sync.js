jest.doMock('datadog-metrics')

const Datadog = require('datadog-metrics')
Datadog.gauge = jest.fn()
Datadog.increment = jest.fn()
Datadog.histogram = jest.fn()

const now = Date.now()
Date.now = jest.fn().mockReturnValue(now)

const Metrics = require('../datadog-metrics-sync')

const run = (f, mock, type) => {
  test(`When we run Metrics.${type}, it should be forwarded on`, () => {
    f('test', 42)
    expect(mock).toBeCalledWith('test', 42, [], now)
  })

  test(`When we run Metrics.${type} with tags, the tags should be logged`, () => {
    f('test', 42, [ 'happy', 'sad:false' ])
    expect(mock).toBeCalledWith('test', 42, [ 'happy', 'sad:false' ], now)
  })

  test(`When we run Metrics.${type} with timestamp, it should be logged instead of current timestamp`, () => {
    f('test', 42, null, 1234567890123)
    expect(mock).toBeCalledWith('test', 42, [], 1234567890123)
  })

  test(`When we run Metrics.${type} with both tags and timestamp, both should be logged`, () => {
    f('test', 42, [ 'happy', 'sad:false' ], 1234567890123)
    expect(mock).toBeCalledWith('test', 42, [ 'happy', 'sad:false' ], 1234567890123)
  })
}

describe('sync client', () => {
  run(Metrics.gauge, Datadog.gauge, 'gauge')
  run(Metrics.increment, Datadog.increment, 'count')
  run(Metrics.histogram, Datadog.histogram, 'histogram')
})