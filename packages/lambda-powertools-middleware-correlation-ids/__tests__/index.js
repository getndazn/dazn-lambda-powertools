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

describe('API Gateway', () => standardTests(genApiGatewayEvent))

describe('SNS', () => standardTests(genSnsEvent))
