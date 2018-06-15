const Metrics = require('../datadog-metrics-async')

const consoleLog = jest.spyOn(global.console, 'log')

beforeEach(consoleLog.mockReset)

afterAll(() => consoleLog.mockRestore())

const expectLogLike = regexPattern => {
  expect(consoleLog).toBeCalled()
  const [ output ] = consoleLog.mock.calls[0]
  expect(output).toMatch(new RegExp(regexPattern))
}

const run = (f, type) => {
  const now = Date.now()
  
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

// broken this out to be a separate describe as we can't mock `Date.now()` here
// otherwise it won't give us the duration of the function
describe('async client trackExecTime', () => {
  test('Metrics.trackExecTime should record execution time of synchronous functions', () => {
    const start = Date.now()
    let end
    const f = () => {
      let timeSinceStart = 0
      do {
        timeSinceStart = Date.now() - start
      } while (timeSinceStart < 10)

      end = start + timeSinceStart

      return 42
    }
    
    const key = 'Metrics.trackExecTime.sync'
    const answer = Metrics.trackExecTime(f, key)
  
    expect(answer).toBe(42)
    expectLogLike(`MONITORING\|${end}\|10\|histogram\|${key}\|#`)
  })
  
  test('Metrics.trackExecTime should record execution time of asynchronous functions', async () => {
    const start = Date.now()
    let end, duration
    const f = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          end = Date.now()
          duration = end - start
          resolve(42)
        }, 10)
      })
    }
  
    const key = 'Metrics.trackExecTime.async'
    const answer = await Metrics.trackExecTime(f, key)
  
    expect(answer).toBe(42)
    expectLogLike(`MONITORING\|${end}\|${duration}\|histogram\|${key}\|#`)
  })
})