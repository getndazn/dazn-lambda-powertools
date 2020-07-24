const _ = require('lodash')
const uuid = require('uuid/v4')
const middy = require('@middy/core')
const CorrelationIds = require('@dazn/lambda-powertools-correlation-ids')
const captureCorrelationIds = require('../index')

global.console.log = jest.fn()

const invokeKinesisHandler = (event, awsRequestId, captureArg, handlerF, recordF, done) => {
  const handler = middy((event, context, cb) => {
    // check the correlation IDs outside the context of a record are correct
    handlerF(CorrelationIds.get())

    context.parsedKinesisEvents.forEach(evt => {
      recordF(evt)
    })

    // check the correlation IDs outside the context of a record are correct
    handlerF(CorrelationIds.get())

    cb(null)
  })
  handler.use(captureCorrelationIds(captureArg))

  handler(event, { awsRequestId }, (err, result) => {
    if (err) {
      throw err
    }

    if (done) done()
  })
}

const kinesis = require('./event-templates/kinesis.json')
const genKinesisEvent = (correlationIDs = {}) => {
  const event = _.cloneDeep(kinesis)

  const data = {
    type: 'test',
    '__context__': correlationIDs
  }

  const record = event.Records[0]
  record.kinesis.data = Buffer.from(JSON.stringify(data)).toString('base64')

  return event
}

const genKinesisEventWithoutJSON = (correlationIDs = {}) => {
  return _.cloneDeep(kinesis)
}

const kinesisTests = () => {
  describe('when sampleDebugLogRate = 0', () => {
    it('always sets debug-log-enabled to false', () => {
      const requestId = uuid()
      invokeKinesisHandler(genKinesisEvent(), requestId, { sampleDebugLogRate: 0 },
        x => {
          expect(x['awsRequestId']).toBe(requestId)
          expect(x['debug-log-enabled']).toBe('false')
        },
        record => {
          const x = record.correlationIds.get()
          expect(x['awsRequestId']).toBe(requestId)
          expect(x['debug-log-enabled']).toBe('false')
        })
    })
  })

  describe('when event lacks JSON payload', () => {
    it('should ignore the event', () => {
      const requestId = uuid()
      invokeKinesisHandler(genKinesisEventWithoutJSON(), requestId, { sampleDebugLogRate: 0 },
        x => {
          expect(x['awsRequestId']).toBe(requestId)
          expect(x['debug-log-enabled']).toBe('false')
        },
        parsedRecord => {
          // We didn't parse any records as they were json.
          expect(parsedRecord).toBeUndefined()
        })
    })
  })

  describe('when sampleDebugLogRate = 1', () => {
    it('always sets debug-log-enabled to true', () => {
      const requestId = uuid()
      invokeKinesisHandler(genKinesisEvent(), requestId, { sampleDebugLogRate: 1 },
        x => {
          expect(x['awsRequestId']).toBe(requestId)
          expect(x['debug-log-enabled']).toBe('true')
        },
        record => {
          const x = record.correlationIds.get()
          expect(x['awsRequestId']).toBe(requestId)
          expect(x['debug-log-enabled']).toBe('true')
        })
    })
  })

  describe('when correlation ID is not provided in the event', () => {
    it('sets it to the AWS Request ID', () => {
      const requestId = uuid()
      invokeKinesisHandler(genKinesisEvent(), requestId, { sampleDebugLogRate: 0 },
        x => {
          // correlation IDs at the handler level
          expect(x['x-correlation-id']).toBe(requestId)
          expect(x['awsRequestId']).toBe(requestId)
        },
        record => {
          const x = record.correlationIds.get()
          // correlation IDs at the record level should just take from the handler
          expect(x['x-correlation-id']).toBe(requestId)
          expect(x['awsRequestId']).toBe(requestId)
        })
    })
  })

  describe('when call-chain-length is not provided in the event', () => {
    it('sets it to 1', () => {
      const requestId = uuid()
      invokeKinesisHandler(genKinesisEvent(), requestId, { sampleDebugLogRate: 0 },
        x => {}, // n/a
        record => {
          const x = record.correlationIds.get()
          expect(x['call-chain-length']).toBe(1)
        })
    })
  })

  describe('when correlation IDs are provided in the event', () => {
    let handlerCorrelationIds
    let record
    let id
    let userId
    let requestId

    beforeEach((done) => {
      id = uuid()
      userId = uuid()

      const correlationIds = {
        'x-correlation-id': id,
        'x-correlation-user-id': userId,
        'User-Agent': 'jest test',
        'debug-log-enabled': 'true'
      }

      const event = genKinesisEvent(correlationIds)
      requestId = uuid()
      invokeKinesisHandler(event, requestId, { sampleDebugLogRate: 0 }, x => {
        handlerCorrelationIds = x
      }, aRecord => {
        record = aRecord
      }, done)
    })

    it('still has the correct handler correlation IDs', () => {
      expect(handlerCorrelationIds['x-correlation-id']).toBe(requestId)
      expect(handlerCorrelationIds['awsRequestId']).toBe(requestId)
    })

    it('captures them on the record', () => {
      const x = record.correlationIds.get()
      // correlation IDs at the record level should match what was passed in
      expect(x['x-correlation-id']).toBe(id)
      expect(x['x-correlation-user-id']).toBe(userId)
      expect(x['User-Agent']).toBe('jest test')
      expect(x['debug-log-enabled']).toBe('true')
      expect(x['awsRequestId']).toBe(requestId)
    })

    it('sets correlationIds as a non-enumerable property', () => {
      expect(record).toHaveProperty('correlationIds')
      expect(record.propertyIsEnumerable('correlationIds')).toBe(false)
    })

    it('sets logger as a non-enumerable property', () => {
      expect(record).toHaveProperty('logger')
      expect(record.propertyIsEnumerable('logger')).toBe(false)
      expect(record.logger.correlationIds).toBe(record.correlationIds)
    })
  })

  describe('when correlation IDs are provided in the event', () => {
    let record
    let id

    beforeEach((done) => {
      id = uuid()

      const correlationIds = {
        'x-correlation-id': id,
        'call-chain-length': 1
      }

      const event = genKinesisEvent(correlationIds)
      invokeKinesisHandler(event, uuid(), { sampleDebugLogRate: 0 },
        () => {},
        aRecord => { record = aRecord },
        done)
    })

    it('increments it by 1', () => {
      const x = record.correlationIds.get()
      expect(x['call-chain-length']).toBe(2)
    })
  })

  describe('when constructLoggerFn provided in the args', () => {
    let record
    let id
    let logger
    let constructLoggerFn

    beforeEach((done) => {
      id = uuid()
      logger = { name: 'newLogger' }
      constructLoggerFn = jest.fn(id => logger)
      const correlationIds = {
        'x-correlation-id': id,
        'call-chain-length': 1
      }

      const event = genKinesisEvent(correlationIds)
      invokeKinesisHandler(event, uuid(), { sampleDebugLogRate: 0, constructLoggerFn },
        () => {},
        aRecord => { record = aRecord },
        done)
    })

    it('sets logger as a non-enumerable property', () => {
      expect(record).toHaveProperty('logger')
      expect(record.propertyIsEnumerable('logger')).toBe(false)
      expect(record.logger).toBe(logger)
      expect(constructLoggerFn.mock.calls.length).toBe(1)
    })
  })
}

describe('Correlation IDs middleware (Kinesis)', () => {
  kinesisTests()
})
