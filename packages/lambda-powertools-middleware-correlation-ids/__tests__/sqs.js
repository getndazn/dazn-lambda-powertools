const _ = require('lodash')
const uuid = require('uuid/v4')
const middy = require('@middy/core')
const CorrelationIds = require('@dazn/lambda-powertools-correlation-ids')
const captureCorrelationIds = require('../index')

global.console.log = jest.fn()

const sqs = require('./event-templates/sqs.json')
const sqsWithoutRawDelivery = require('./event-templates/sqs-wrapped-sns.json')
const genSqsEvent = (wrappedSns, correlationIDs = {}) => {
  if (wrappedSns) {
    const event = _.cloneDeep(sqsWithoutRawDelivery)
    const body = JSON.parse(event.Records[0].body)

    body.MessageAttributes = _.mapValues(correlationIDs, value => ({
      Type: 'String',
      Value: value
    }))

    event.Records[0].body = JSON.stringify(body)

    return event
  } else {
    const event = _.cloneDeep(sqs)

    event.Records[0].messageAttributes = _.mapValues(correlationIDs, value => ({
      stringValue: value,
      stringListValues: [],
      binaryListValues: [],
      dataType: 'String'
    }))

    return event
  }
}

const sqsTests = (wrappedSns = false) => {
  describe('when sampleDebugLogRate = 0', () => {
    it('always sets debug-log-enabled to false', () => {
      const requestId = uuid()
      invokeSqsHandler(genSqsEvent(wrappedSns), requestId, { sampleDebugLogRate: 0 },
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

  describe('when sampleDebugLogRate = 1', () => {
    it('always sets debug-log-enabled to true', () => {
      const requestId = uuid()
      invokeSqsHandler(genSqsEvent(wrappedSns), requestId, 1,
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
      invokeSqsHandler(genSqsEvent(wrappedSns), requestId, { sampleDebugLogRate: 0 },
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
      invokeSqsHandler(genSqsEvent(wrappedSns), requestId, { sampleDebugLogRate: 0 },
        x => { // n/a
        },
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

      const event = genSqsEvent(wrappedSns, correlationIds)
      requestId = uuid()
      invokeSqsHandler(event, requestId, { sampleDebugLogRate: 0 }, x => {
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

  describe('when call-chain-length is provided in the event', () => {
    let record
    let id

    beforeEach((done) => {
      id = uuid()

      const correlationIds = {
        'x-correlation-id': id,
        'call-chain-length': 1
      }

      const event = genSqsEvent(wrappedSns, correlationIds)
      invokeSqsHandler(event, uuid(), { sampleDebugLogRate: 0 },
        () => {},
        aRecord => { record = aRecord },
        done)
    })

    it('increments it by 1', () => {
      const x = record.correlationIds.get()
      // correlation IDs at the record level should match what was passed in
      expect(x['x-correlation-id']).toBe(id)
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

      const event = genSqsEvent(wrappedSns, correlationIds)
      invokeSqsHandler(event, uuid(), { sampleDebugLogRate: 0, constructLoggerFn },
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

const sqsWrappedSnsTests = () => {
  sqsTests(true)

  describe('when correlation ID is not provided in the event and message attributes are set in the event body', () => {
    it('does not modify sqs record message attributes', () => {
      const messageAttributes = {
        'att1': 'value1',
        'att2': 'value2',
        'att3': 'value3'
      }

      const event = genSqsEvent(true)
      const body = JSON.parse(event.Records[0].body)
      body.MessageAttributes = _.mapValues(messageAttributes, value => ({
        Type: 'String',
        Value: value
      }))
      event.Records[0].body = JSON.stringify(body)

      invokeSqsHandler(event, uuid(), { sampleDebugLogRate: 0 },
        () => ({}),
        record => {
          expect(record.messageAttributes).toEqual({})
        })
    })
  })
}

const invokeSqsHandler = (event, awsRequestId, captureArg, handlerF, recordF, done) => {
  const handler = middy((event, context, cb) => {
    // check the correlation IDs outside the context of a record are correct
    handlerF(CorrelationIds.get())

    event.Records.forEach(record => {
      recordF(record)
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

describe('Correlation IDs middleware (SQS)', () => {
  sqsTests()
})

describe('Correlation IDs middleware (SQS wrapped SNS message)', () => {
  sqsWrappedSnsTests()
})
