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

const invokeSqsHandler = (event, awsRequestId, sampleDebugLogRate, handlerF, recordF) => {
  const handler = middy((event, context, cb) => {
    // check the correlation IDs outside the context of a record are correct
    handlerF(CorrelationIds.get())

    event.Records.forEach(record => {
      record.scopeToThis()
      recordF(CorrelationIds.get()) // check the correlation IDs inside is correct
      record.unscope()
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
  })
}

const invokeKinesisHandler = (event, awsRequestId, sampleDebugLogRate, handlerF, recordF) => {
  const handler = middy((event, context, cb) => {
    // check the correlation IDs outside the context of a record are correct
    handlerF(CorrelationIds.get())

    context.parsedKinesisEvents.forEach(evt => {
      evt.scopeToThis()
      recordF(CorrelationIds.get()) // check the correlation IDs inside is correct
      evt.unscope()
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
  })
}

const genApiGatewayEvent = (correlationIds = {}) => {
  let event = require('./apig.json')
  Object.assign(event.headers, correlationIds)

  return event
}

const genSnsEvent = (correlationIDs = {}) => {
  let event = require('./sns.json')
  let messageAttributes = _.mapValues(correlationIDs, value => ({
    Type: 'String',
    Value: value
  }))

  Object.assign(event.Records[0].Sns.MessageAttributes, messageAttributes)

  return event
}

const genSqsEvent = (correlationIDs = {}) => {
  const event = require('./sqs.json')

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

const genKinesisEvent = (correlationIDs = {}) => {
  const event = require('./kinesis.json')
  const data = {
    type: 'test',
    '__context__': correlationIDs
  }

  const record = event.Records[0]
  record.kinesis.data = Buffer.from(JSON.stringify(data)).toString('base64')

  return event
}

const genSfnEvent = (correlationIDs = {}) => {
  let event = require('./sfn.json')
  Object.assign(event, { __context__: correlationIDs })

  return event
}

const standardTests = (genEvent) => {
  test('when sampleDebugLogRate is 0, debug-log-enabled is always set to false', () => {
    const requestId = uuid()
    invokeHandler(genEvent(), requestId, 0, x => {
      expect(x['awsRequestId']).toBe(requestId)
      expect(x['debug-log-enabled']).toBe('false')
    })
  })

  test('when sampleDebugLogRate is 1, debug-log-enabled is always set to true', () => {
    const requestId = uuid()
    invokeHandler(genEvent(), requestId, 1, x => {
      expect(x['awsRequestId']).toBe(requestId)
      expect(x['debug-log-enabled']).toBe('true')
    })
  })

  test('when correlation ID are not provided in the event, one is initialized from the awsRequestId', () => {
    const requestId = uuid()
    invokeHandler(genEvent(), requestId, 0, x => {
      expect(x['x-correlation-id']).toBe(requestId)
      expect(x['awsRequestId']).toBe(requestId)
    })
  })

  test('when correlation IDs are provided in the event, they are captured', () => {
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
}

const sqsTests = () => {
  test('when sampleDebugLogRate is 0, debug-log-enabled is always set to false', () => {
    const requestId = uuid()
    invokeSqsHandler(genSqsEvent(), requestId, 0,
      x => {
        expect(x['awsRequestId']).toBe(requestId)
        expect(x['debug-log-enabled']).toBe('false')
      },
      x => {
        expect(x['awsRequestId']).toBe(requestId)
        expect(x['debug-log-enabled']).toBe('false')
      })
  })

  test('when sampleDebugLogRate is 1, debug-log-enabled is always set to true', () => {
    const requestId = uuid()
    invokeSqsHandler(genSqsEvent(), requestId, 1,
      x => {
        expect(x['awsRequestId']).toBe(requestId)
        expect(x['debug-log-enabled']).toBe('true')
      },
      x => {
        expect(x['awsRequestId']).toBe(requestId)
        expect(x['debug-log-enabled']).toBe('true')
      })
  })

  test('when correlation ID are not provided in the event, one is initialized from the awsRequestId', () => {
    const requestId = uuid()
    invokeSqsHandler(genSqsEvent(), requestId, 0,
      x => {
        // correlation IDs at the handler level
        expect(x['x-correlation-id']).toBe(requestId)
        expect(x['awsRequestId']).toBe(requestId)
      },
      x => {
        // correlation IDs at the record level should just take from the handler
        expect(x['x-correlation-id']).toBe(requestId)
        expect(x['awsRequestId']).toBe(requestId)
      })
  })

  test('when correlation IDs are provided in the event, they are captured', () => {
    const id = uuid()
    const userId = uuid()

    const correlationIds = {
      'x-correlation-id': id,
      'x-correlation-user-id': userId,
      'User-Agent': 'jest test',
      'debug-log-enabled': 'true'
    }

    const event = genSqsEvent(correlationIds)
    const requestId = uuid()
    invokeSqsHandler(event, requestId, 0,
      x => {
        // correlation IDs at the handler level
        expect(x['x-correlation-id']).toBe(requestId)
        expect(x['awsRequestId']).toBe(requestId)
      },
      x => {
        // correlation IDs at the record level should match what was passed in
        expect(x['x-correlation-id']).toBe(id)
        expect(x['x-correlation-user-id']).toBe(userId)
        expect(x['User-Agent']).toBe('jest test')
        expect(x['debug-log-enabled']).toBe('true')
        expect(x['awsRequestId']).toBe(requestId)
      })
  })
}

const kinesisTests = () => {
  test('when sampleDebugLogRate is 0, debug-log-enabled is always set to false', () => {
    const requestId = uuid()
    invokeKinesisHandler(genKinesisEvent(), requestId, 0,
      x => {
        expect(x['awsRequestId']).toBe(requestId)
        expect(x['debug-log-enabled']).toBe('false')
      },
      x => {
        expect(x['awsRequestId']).toBe(requestId)
        expect(x['debug-log-enabled']).toBe('false')
      })
  })

  test('when sampleDebugLogRate is 1, debug-log-enabled is always set to true', () => {
    const requestId = uuid()
    invokeKinesisHandler(genKinesisEvent(), requestId, 1,
      x => {
        expect(x['awsRequestId']).toBe(requestId)
        expect(x['debug-log-enabled']).toBe('true')
      },
      x => {
        expect(x['awsRequestId']).toBe(requestId)
        expect(x['debug-log-enabled']).toBe('true')
      })
  })

  test('when correlation ID are not provided in the event, one is initialized from the awsRequestId', () => {
    const requestId = uuid()
    invokeKinesisHandler(genKinesisEvent(), requestId, 0,
      x => {
        // correlation IDs at the handler level
        expect(x['x-correlation-id']).toBe(requestId)
        expect(x['awsRequestId']).toBe(requestId)
      },
      x => {
        // correlation IDs at the record level should just take from the handler
        expect(x['x-correlation-id']).toBe(requestId)
        expect(x['awsRequestId']).toBe(requestId)
      })
  })

  test('when correlation IDs are provided in the event, they are captured', () => {
    const id = uuid()
    const userId = uuid()

    const correlationIds = {
      'x-correlation-id': id,
      'x-correlation-user-id': userId,
      'User-Agent': 'jest test',
      'debug-log-enabled': 'true'
    }

    const event = genKinesisEvent(correlationIds)
    const requestId = uuid()
    invokeKinesisHandler(event, requestId, 0,
      x => {
        // correlation IDs at the handler level
        expect(x['x-correlation-id']).toBe(requestId)
        expect(x['awsRequestId']).toBe(requestId)
      },
      x => {
        // correlation IDs at the record level should match what was passed in
        expect(x['x-correlation-id']).toBe(id)
        expect(x['x-correlation-user-id']).toBe(userId)
        expect(x['User-Agent']).toBe('jest test')
        expect(x['debug-log-enabled']).toBe('true')
        expect(x['awsRequestId']).toBe(requestId)
      })
  })
}

describe('API Gateway', () => standardTests(genApiGatewayEvent))

describe('SNS', () => standardTests(genSnsEvent))

describe('SFN', () => standardTests(genSfnEvent))

describe('SQS', () => sqsTests())

describe('Kinesis', () => kinesisTests())
