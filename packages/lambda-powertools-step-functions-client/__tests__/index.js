const AWS = require('aws-sdk')

const mockStartExecution = jest.fn()
AWS.StepFunctions.prototype.startExecution = mockStartExecution

const SFN = require('../index')
const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')

beforeEach(() => {
  mockStartExecution.mockReturnValueOnce({
    promise: async () => Promise.resolve()
  })
})

afterEach(() => {
  mockStartExecution.mockClear()
  CorrelationIds.clearAll()
})

test('When there are no correlation IDs, __context__ is empty', async () => {
  const input = {
    userId: 'theburningmonk'
  }

  const params = {
    stateMachineArn: 'sfn-arn',
    input: JSON.stringify(input),
    name: 'no-context'
  }
  await SFN.startExecution(params).promise()

  const expectedInput = Object.assign({}, input, { __context__: {} })

  expect(mockStartExecution).toBeCalled()
  const actualParams = mockStartExecution.mock.calls[0][0]
  expect(actualParams.stateMachineArn).toBe('sfn-arn')
  expect(actualParams.name).toBe('no-context')
  expect(JSON.parse(actualParams.input)).toEqual(expectedInput)
})

test('Correlation IDs are forwarded in a __context__ field', async () => {
  CorrelationIds.replaceAllWith({
    'x-correlation-id': 'id',
    'debug-log-enabled': 'true'
  })

  const input = {
    userId: 'theburningmonk'
  }

  const params = {
    stateMachineArn: 'sfn-arn',
    input: JSON.stringify(input),
    name: 'has-context'
  }
  await SFN.startExecution(params).promise()

  const expectedInput = Object.assign(
    {},
    input,
    {
      __context__: {
        'x-correlation-id': 'id',
        'debug-log-enabled': 'true'
      }
    })

  expect(mockStartExecution).toBeCalled()
  const actualParams = mockStartExecution.mock.calls[0][0]
  expect(actualParams.stateMachineArn).toBe('sfn-arn')
  expect(actualParams.name).toBe('has-context')
  expect(JSON.parse(actualParams.input)).toEqual(expectedInput)
})

test('When payload is not JSON, request is not modified', async () => {
  const params = {
    stateMachineArn: 'sfn-arn',
    input: 'dGhpcyBpcyBub3QgSlNPTg==',
    name: 'not-json'
  }
  await SFN.startExecution(params).promise()

  expect(mockStartExecution).toBeCalledWith(params)
})
