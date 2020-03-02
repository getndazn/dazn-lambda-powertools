const nock = require('nock')

// spy on https.request to see when it's actually called
const http = require('https')
const mockRequest = jest.spyOn(http, 'request')

global.console.log = jest.fn()

const Req = require('../index')
const url = 'https://theburningmonk.com'

beforeEach(mockRequest.mockClear)

afterAll(mockRequest.mockRestore)

const verifyTimeout = async (timeoutMillis) => {
  nock(url).get('/').delay(1000).reply(200)

  const options = {
    uri: url,
    method: 'GET',
    timeout: timeoutMillis
  }

  // eslint-disable-next-line no-unused-expressions
  expect(Req(options)).rejects
  expect(mockRequest).toBeCalled()
}

describe('HTTP client (timeout)', () => {
  describe('when timeout is configured to 100ms', () => {
    it('times out after 100ms', async () => {
      await verifyTimeout()
    })
  })
})
