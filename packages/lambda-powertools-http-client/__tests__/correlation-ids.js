const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')
const nock = require('nock')

// spy on https.request to see when it's actually called
const http = require('https')
const mockRequest = jest.spyOn(http, 'request')

const Req = require('../index')

beforeEach(mockRequest.mockClear)

afterEach(CorrelationIds.clearAll)

afterAll(mockRequest.mockRestore)

const verifyHeaders = async (userHeaders, f) => {
  const url = 'https://theburningmonk.com'
  nock(url).get('/').reply(200)

  await Req({
    uri: url,
    method: 'GET',
    headers: userHeaders
  })

  expect(mockRequest).toBeCalled()

  // inspect the ClientRequest object returned for the HTTP headers we'll send
  // see https://nodejs.org/docs/latest-v8.x/api/http.html#http_class_http_clientrequest

  const result = mockRequest.mock.results[0]
  expect(result.isThrow).toBe(false)

  const clientReq = result.value
  const headers = clientReq.headers

  f(headers)
}

test('When there are no correlation IDs, nothing is added to HTTP headers', async () => {
  await verifyHeaders({}, headers => {
    expect(headers['x-correlation-id']).toBeUndefined()
    expect(headers['x-correlation-user-id']).toBeUndefined()
  })
})

test('Correlation IDs are included as HTTP headers', async () => {
  CorrelationIds.set('id', 'id')
  CorrelationIds.set('user-id', 'theburningmonk')

  await verifyHeaders({}, headers => {
    expect(headers['x-correlation-id']).toBe('id')
    expect(headers['x-correlation-user-id']).toBe('theburningmonk')
  })
})

test('User-specified headers are not affect by our correlation IDs', async () => {
  CorrelationIds.set('id', 'id')
  CorrelationIds.set('user-id', 'theburningmonk')

  const userHeaders = {
    'order-id': 'order-id'
  }

  await verifyHeaders(userHeaders, headers => {
    expect(headers['order-id']).toBe('order-id')
  })
})

test('Correlation IDs should not override user-specified headers', async () => {
  CorrelationIds.set('id', 'id')
  CorrelationIds.set('user-id', 'theburningmonk')

  const userHeaders = {
    'x-correlation-id': 'user-id' // this should override what we set with the CorrelationIds module
  }

  await verifyHeaders(userHeaders, headers => {
    expect(headers['x-correlation-id']).toBe('user-id')
    expect(headers['x-correlation-user-id']).toBe('theburningmonk')
  })
})
