process.env.AWS_REGION = 'us-east-1'
process.env.AWS_LAMBDA_FUNCTION_NAME = 'test'
process.env.AWS_LAMBDA_FUNCTION_VERSION = '$LATEST'
process.env.STAGE = 'dev'
process.env.DATADOG_API_KEY = 'test-key'

jest.doMock('datadog-metrics')
const Datadog = require('datadog-metrics')
Datadog.init  = jest.fn()
Datadog.flush = jest.fn()

const middy = require('middy')
const flushMiddleware = require('../index')

const invokeHandler = () => {
  const handler = middy((event, context, cb) => {
    cb(null)
  })
  handler.use(flushMiddleware({ prefix: 'wat' }))

  handler({}, {}, (err, result) => {})
}

test('metrics should be initialized at the start of invocation', () => {
  invokeHandler()

  expect(Datadog.init).toBeCalledWith({
    apiKey: 'test-key',
    prefix: 'wat',
    defaultTags: [
      `awsRegion:us-east-1`,
      `functionName:test`,
      `functionVersion:$LATEST`,
      `environment:dev`
    ],
    flushIntervalSeconds: 0
  })
})

test('metrics should be flushed at the end of invocation', () => {
  invokeHandler()

  expect(Datadog.flush).toBeCalled()
})