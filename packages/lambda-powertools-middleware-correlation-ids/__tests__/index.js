const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')
const middy = require('middy')
const captureCorrelationIds = require('../index')
const uuid = require('uuid/v4')
const _ = require('lodash')

global.console.log = jest.fn()

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

const apig = require('./event_templates/apig.json')
const genApiGatewayEvent = (correlationIds = {}) => {
  const event = _.cloneDeep(apig)
  event.headers = correlationIds
  return event
}

const sns = require('./event_templates/sns.json')
const genSnsEvent = (correlationIDs = {}) => {
  const event = _.cloneDeep(sns)
  const messageAttributes = _.mapValues(correlationIDs, value => ({
    Type: 'String',
    Value: value
  }))

  Object.assign(event.Records[0].Sns.MessageAttributes, messageAttributes)

  return event
}

const sqs = require('./event_templates/sqs.json')
const sqsWithoutRawDelivery = require('./event_templates/sqs-wrapped-sns.json')
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

const kinesis = require('./event_templates/kinesis.json')
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

const sfn = require('./event_templates/sfn.json')
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

const sqsTests = (wrappedSns = false) => {
  describe('when sampleDebugLogRate = 0', () => {
    it('always sets debug-log-enabled to false', () => {
      const requestId = uuid()
      invokeSqsHandler(genSqsEvent(wrappedSns), requestId, 0,
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
      invokeSqsHandler(genSqsEvent(wrappedSns), requestId, 0,
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
      invokeSqsHandler(genSqsEvent(wrappedSns), requestId, 0,
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
      invokeSqsHandler(event, uuid(), 0,
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

      invokeSqsHandler(event, uuid(), 0,
        () => ({}),
        record => {
          expect(record.messageAttributes).toEqual({})
        })
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

  describe('when event lacks JSON payload', () => {
    it('should ignore the event', () => {
      const requestId = uuid()
      invokeKinesisHandler(genKinesisEventWithoutJSON(), requestId, 0,
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

  describe('when call-chain-length is not provided in the event', () => {
    it('sets it to 1', () => {
      const requestId = uuid()
      invokeKinesisHandler(genKinesisEvent(), requestId, 0,
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
      invokeKinesisHandler(event, uuid(), 0,
        () => {},
        aRecord => { record = aRecord },
        done)
    })

    it('increments it by 1', () => {
      const x = record.correlationIds.get()
      expect(x['call-chain-length']).toBe(2)
    })
  })
}

describe('correlation IDs are always initialized', () => {
  describe('when sampleDebugLogRate = 0', () => {
    it('always sets debug-log-enabled to false', () => {
      const requestId = uuid()
      invokeHandler({}, requestId, 0, x => {
        expect(x['awsRequestId']).toBe(requestId)
        expect(x['debug-log-enabled']).toBe('false')
      })
    })
  })

  describe('when sampleDebugLogRate = 1', () => {
    it('always sets debug-log-enabled to true', () => {
      const requestId = uuid()
      invokeHandler({}, requestId, 1, x => {
        expect(x['awsRequestId']).toBe(requestId)
        expect(x['debug-log-enabled']).toBe('true')
      })
    })
  })

  it('always initialises it from the awsRequestId', () => {
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

  describe('SQS wrapped SNS message', () => sqsWrappedSnsTests())

  describe('Kinesis', () => kinesisTests())
})
