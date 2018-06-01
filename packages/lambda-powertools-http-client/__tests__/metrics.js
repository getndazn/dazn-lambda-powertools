const nock = require('nock')

// spy on https.request to see when it's actually called
const http = require('https')
const mockRequest = jest.spyOn(http, 'request')

// mock the metrics module to check if they're invoked
const Metrics = require('@perform/lambda-powertools-datadog-metrics')

const mockHistogram = jest.fn()
Metrics.histogram = mockHistogram
const mockIncrement = jest.fn()
Metrics.increment = mockIncrement

const region = 'us-east-1'
const funcName = 'test-function'
const funcVersion = '$LATEST'
const url = 'https://theburningmonk.com'

process.env.AWS_REGION = region
process.env.AWS_LAMBDA_FUNCTION_NAME = funcName
process.env.AWS_LAMBDA_FUNCTION_VERSION = funcVersion

const Req = require('../index')

afterEach(() => {
  mockRequest.mockClear()
  mockHistogram.mockClear()
  mockIncrement.mockClear()
})

afterAll(mockRequest.mockRestore)

const successReq = async () => {  
  nock(url).get('/').reply(200)

  await Req({
    uri : url,
    method : 'GET'
  })

  expect(mockRequest).toBeCalled()
}

const failedReq = async () => {  
  nock(url).get('/').reply(500, { test: true })

  await Req({
    uri : url,
    method : 'GET'
  }).catch(err => {
    // swallow the exception, we're only interested in the side-effects
    // of recording the metrics
  })

  expect(mockRequest).toBeCalled()
}

const verifyTags = (tags, statusCode = 200) => {
  expect(tags).toContainEqual(`awsRegion:${region}`)
  expect(tags).toContainEqual(`functionName:${funcName}`)
  expect(tags).toContainEqual(`functionVersion:${funcVersion}`)
  expect(tags).toContainEqual(`method:GET`)
  expect(tags).toContainEqual(`path:/`)
  expect(tags).toContainEqual(`statusCode:${statusCode}`)
}

test('Successful request should record custom histogram metric', async () => {
  await successReq()

  expect(mockHistogram).toBeCalled()
  const [key, value, tags] = mockHistogram.mock.calls[0]
  expect(key).toBe('theburningmonk.com.response.latency')
  expect(value).toBeLessThan(100) // come on, no way it'll be higher than this with Nock

  verifyTags(tags)
})

test('Successful request should record custom count metric', async () => {
  await successReq()

  expect(mockIncrement).toBeCalled()
  const [key, value, tags] = mockIncrement.mock.calls[0]
  expect(key).toBe('theburningmonk.com.response.200')
  expect(value).toBe(1)

  verifyTags(tags)
})

test('Failed request should record custom histogram metric', async () => {
  await failedReq()

  expect(mockHistogram).toBeCalled()
  const [key, value, tags] = mockHistogram.mock.calls[0]
  expect(key).toBe('theburningmonk.com.response.latency')
  expect(value).toBeLessThan(100) // come on, no way it'll be higher than this with Nock

  verifyTags(tags, 500)
})

test('Failed request should record custom count metric', async () => {
  await failedReq()

  expect(mockIncrement).toBeCalled()
  const [key, value, tags] = mockIncrement.mock.calls[0]
  expect(key).toBe('theburningmonk.com.response.500')
  expect(value).toBe(1)

  verifyTags(tags, 500)
})