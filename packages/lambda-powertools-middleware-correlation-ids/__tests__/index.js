const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')
const middy = require('middy')
const captureCorrelationIds = require('../index')
const uuid = require('uuid/v4')
const _ = require('lodash')

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

const invokeSqsHandler = (event, awsRequestId, sampleDebugLogRate, handlerF, recordF, done) => {
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
  handler.use(captureCorrelationIds({ sampleDebugLogRate }))

  handler(event, { awsRequestId }, (err, result) => {
    if (err) {
      throw err
    }

    if (done) done()
  })
}

const invokeKinesisHandler = (event, awsRequestId, sampleDebugLogRate, handlerF, recordF, done) => {
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
  handler.use(captureCorrelationIds({ sampleDebugLogRate }))

  handler(event, { awsRequestId }, (err, result) => {
    if (err) {
      throw err
    }

    if (done) done()
  })
}

const apig = require('./apig.json')
const genApiGatewayEvent = (correlationIds = {}) => {
  const event = _.cloneDeep(apig)
  event.headers = correlationIds
  return event
}

const sns = require('./sns.json')
const genSnsEvent = (correlationIDs = {}) => {
  const event = _.cloneDeep(sns)
  const messageAttributes = _.mapValues(correlationIDs, value => ({
    Type: 'String',
    Value: value
  }))

  Object.assign(event.Records[0].Sns.MessageAttributes, messageAttributes)

  return event
}

const sqs = require('./sqs.json')
const genSqsEvent = (correlationIDs = {}) => {
  const event = _.cloneDeep(sqs)
  const messageAttributes = _.mapValues(correlationIDs, value => ({
    stringValue: value,
    stringListValues: [],
    binaryListValues: [],
    dataType: 'String'
  }))

  const record = event.Records[0]
  record.messageAttributes = messageAttributes

  return event
}

const kinesis = require('./kinesis')
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

const sfn = require('./sfn.json')
const genSfnEvent = (correlationIDs = {}) => {
  const event = _.cloneDeep(sfn)
  event.__context__ = correlationIDs
  return event
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
}

const sqsTests = () => {
  describe('when sampleDebugLogRate = 0', () => {
    it('always sets debug-log-enabled to false', () => {
      const requestId = uuid()
      invokeSqsHandler(genSqsEvent(), requestId, 0,
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
      invokeSqsHandler(genSqsEvent(), requestId, 1,
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
      invokeSqsHandler(genSqsEvent(), requestId, 0,
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

      const event = genSqsEvent(correlationIds)
      requestId = uuid()
      invokeSqsHandler(event, requestId, 0, x => {
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
}

const kinesisTests = () => {
  describe('when sampleDebugLogRate = 0', () => {
    it('always sets debug-log-enabled to false', () => {
      const requestId = uuid()
      invokeKinesisHandler(genKinesisEvent(), requestId, 0,
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
      invokeKinesisHandler(genKinesisEvent(), requestId, 1,
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
      invokeKinesisHandler(genKinesisEvent(), requestId, 0,
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
      invokeKinesisHandler(event, requestId, 0, x => {
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
}

describe('correlation IDs are always initialized', () => {
  test('when sampleDebugLogRate is 0, debug-log-enabled is always set to false', () => {
    const requestId = uuid()
    invokeHandler({}, requestId, 0, x => {
      expect(x['awsRequestId']).toBe(requestId)
      expect(x['debug-log-enabled']).toBe('false')
    })
  })

  test('when sampleDebugLogRate is 1, debug-log-enabled is always set to true', () => {
    const requestId = uuid()
    invokeHandler({}, requestId, 1, x => {
      expect(x['awsRequestId']).toBe(requestId)
      expect(x['debug-log-enabled']).toBe('true')
    })
  })

  test('correlation ID is always initialized from the awsRequestId', () => {
    const requestId = uuid()
    invokeHandler({}, requestId, 0, x => {
      expect(x['x-correlation-id']).toBe(requestId)
      expect(x['awsRequestId']).toBe(requestId)
    })
  })
})

describe('Correlation IDs middleware', () => {
  describe('API Gateway', () => standardTests(genApiGatewayEvent))

  describe('SNS', () => standardTests(genSnsEvent))

  describe('SFN', () => standardTests(genSfnEvent))

  describe('SQS', () => sqsTests())

  describe('Kinesis', () => kinesisTests())
})
