const uuid = require('uuid/v4')
const middy = require('@middy/core')
const CorrelationIds = require('@dazn/lambda-powertools-correlation-ids')
const captureCorrelationIds = require('../index')

const invokeHandler = (event, awsRequestId, sampleDebugLogRate, f) => {
  const handler = middy((event, context, cb) => {
    const correlationIds = CorrelationIds.get()
    f(correlationIds)

    cb(null)
  })
  handler.use(captureCorrelationIds({ sampleDebugLogRate }))

  handler(event, { awsRequestId }, (err, result) => {
    if (err) {
      throw err
    }
  })
}

const standardTests = (genEvent) => {
  describe('when sampleDebugLogRate = 0', () => {
    it('always sets debug-log-enabled to false', () => {
      const requestId = uuid()
      invokeHandler(genEvent(), requestId, 0, x => {
        expect(x['awsRequestId']).toBe(requestId)
        expect(x['x-correlation-id']).toBe(requestId)
        expect(x['debug-log-enabled']).toBe('false')
      })
    })
  })

  describe('when sampleDebugLogRate = 1', () => {
    it('always sets debug-log-enabled to true', () => {
      const requestId = uuid()
      invokeHandler(genEvent(), requestId, 1, x => {
        expect(x['awsRequestId']).toBe(requestId)
        expect(x['x-correlation-id']).toBe(requestId)
        expect(x['debug-log-enabled']).toBe('true')
      })
    })
  })

  describe('when correlation ID is not provided in the event', () => {
    it('sets it to the AWS Request ID', () => {
      const requestId = uuid()
      invokeHandler(genEvent(), requestId, 0, x => {
        expect(x['x-correlation-id']).toBe(requestId)
        expect(x['awsRequestId']).toBe(requestId)
      })
    })
  })

  describe('when call-chain-length is not provided in the event', () => {
    it('sets it to 1', () => {
      const requestId = uuid()
      invokeHandler(genEvent(), requestId, 0, x => {
        expect(x['call-chain-length']).toBe(1)
      })
    })
  })

  describe('when correlation IDs are provided in the event', () => {
    it('captures them', () => {
      const id = uuid()
      const userId = uuid()

      const correlationIds = {
        'x-correlation-id': id,
        'x-correlation-user-id': userId,
        'User-Agent': 'jest test',
        'debug-log-enabled': 'true'
      }

      const event = genEvent(correlationIds)

      const requestId = uuid()
      invokeHandler(event, requestId, 0, x => {
        expect(x['x-correlation-id']).toBe(id)
        expect(x['x-correlation-user-id']).toBe(userId)
        expect(x['User-Agent']).toBe('jest test')
        expect(x['debug-log-enabled']).toBe('true')
        expect(x['awsRequestId']).toBe(requestId)
      })
    })
  })

  describe('when call-chain-length is provided in the event', () => {
    it('increments it by 1', () => {
      const id = uuid()

      const correlationIds = {
        'x-correlation-id': id,
        'call-chain-length': 1
      }

      const event = genEvent(correlationIds)

      const requestId = uuid()
      invokeHandler(event, requestId, 0, x => {
        expect(x['x-correlation-id']).toBe(id)
        expect(x['call-chain-length']).toBe(2)
      })
    })
  })
}

// dummy test to stop the jest scheduler from complaining about not finding any tests
test.skip('skip', () => {})

module.exports = {
  invokeHandler,
  standardTests
}
