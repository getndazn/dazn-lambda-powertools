const consoleLog = jest.spyOn(global.console, 'log')

const middy = require('middy')
const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')
const stopInfiniteLoop = require('../index')

const getHandler = () => middy(async () => {}).use(stopInfiniteLoop(3))

const warnLogWasWritten = (f) => {
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
      const handler = getHandler()
      await handler({}, {}, () => {})

      expect(consoleLog).not.toBeCalled()
    })
  })

  describe('when call-chain-length is below threshold', () => {
    it('does nothing', async () => {
      const handler = getHandler()

      CorrelationIds.replaceAllWith({
        'call-chain-length': 2
      })
      await handler({}, {}, () => {})

      expect(consoleLog).not.toBeCalled()
    })
  })

  describe('when call-chain-length reaches threshold', () => {
    it('should throw', async () => {
      const handler = getHandler()
      const event = { foo: 'bar' }

      CorrelationIds.replaceAllWith({
        'call-chain-length': 3
      })
      await handler(event, { awsRequestId: 'test' }, () => {})

      warnLogWasWritten(x => {
        expect(x.awsRequestId).toBe('test')
        expect(x.invocationEvent).toBeDefined()
        expect(JSON.parse(x.invocationEvent)).toEqual(event)
      })
    })
  })
})
