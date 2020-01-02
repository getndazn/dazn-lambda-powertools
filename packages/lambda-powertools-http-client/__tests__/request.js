const nock = require('nock')

// spy on https.request to see when it's actually called
const http = require('https')
const mockRequest = jest.spyOn(http, 'request')

global.console.log = jest.fn()

const Req = require('../index')
const url = 'https://theburningmonk.com'
const host = 'theburningmonk.com:443'

beforeEach(mockRequest.mockClear)

afterAll(mockRequest.mockRestore)

const verifyRequestMethod = async (method, f) => {
  f()

  await Req({
    uri: url,
    method: method,
    headers: {}
  })

  expect(mockRequest).toBeCalled()

  const methodToCall = mockRequest.mock.calls[0][0].method
  expect(methodToCall).toEqual(method)
}

const verifyRequestUri = async (option) => {
  nock(url).get('/').reply(200)

  const options = {
    method: 'GET',
    headers: {}
  }
  options[option] = url
  await Req(options)

  expect(mockRequest).toBeCalled()

  const hostCalled = mockRequest.mock.calls[0][0].host
  expect(hostCalled).toEqual(host)
}

describe('HTTP client (request)', () => {
  it.each([
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'DELETE',
    'PATCH'
  ])('calls %s method correctly', async (method) => {
    await verifyRequestMethod(method, f => {
      nock(url)[method.toLowerCase()]('/').reply(200)
    })
  })

  it.each([
    'uri',
    'url'
  ])('calls request with %s option correctly', async (option) => {
    await verifyRequestUri(option)
  })
})
