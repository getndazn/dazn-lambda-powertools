const consoleLog = jest.fn()
global.console.log = consoleLog

const middy = require('middy')
const CorrelationIds = require('@dazn/lambda-powertools-correlation-ids')
const stopInfiniteLoop = require('../index')

const invokeHandler = async (event, awsRequestId) => {
  const handler = middy(async () => {}).use(stopInfiniteLoop(3))
  await new Promise((resolve, reject) => {
    handler(event, { awsRequestId }, (err, resp) => {
      if (err) {
        reject(err)
      } else {
        resolve(resp)
      }
    })
  })
}

const errorLogWasWritten = (f) => {
  expect(consoleLog).toBeCalled()
  const log = JSON.parse(consoleLog.mock.calls[0])
  expect(log.sLevel).toBe('ERROR')
  expect(log.level).toBe(50)
  expect(log.message).toBe('Possible infinite recursion detected, invocation is stopped.')

  f(log)
}

describe('Stop infinite loop middleware', () => {
  describe('when call-chain-length is not set', () => {
    it('does nothing', async () => {
      await invokeHandler({}, {})

      expect(consoleLog).not.toBeCalled()
    })
  })

  describe('when call-chain-length is below threshold', () => {
    it('does nothing', async () => {
      CorrelationIds.replaceAllWith({
        'call-chain-length': 2
      })
      await invokeHandler({}, {})

      expect(consoleLog).not.toBeCalled()
    })
  })

  describe('when call-chain-length reaches threshold', () => {
    it('should throw', async () => {
      const event = { foo: 'bar' }
      const awsRequestId = 'test'

      CorrelationIds.replaceAllWith({
        'call-chain-length': 3
      })
      await expect(invokeHandler(event, awsRequestId)).rejects.toEqual(
        new Error("'call-chain-length' reached threshold of 3, possible infinite recursion"))

      errorLogWasWritten(x => {
        expect(x.awsRequestId).toBe('test')
        expect(x.invocationEvent).toBeDefined()
        expect(JSON.parse(x.invocationEvent)).toEqual(event)
      })
    })
  })
})
