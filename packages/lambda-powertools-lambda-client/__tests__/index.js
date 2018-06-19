const AWS = require('aws-sdk')

const mockInvoke = jest.fn()
const mockInvokeAsync = jest.fn()
AWS.Lambda.prototype.invoke = mockInvoke
AWS.Lambda.prototype.invokeAsync = mockInvokeAsync

const Lambda = require('../index')
const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')

beforeEach(() => {
  mockInvoke.mockReturnValueOnce({
    promise: async () => Promise.resolve()
  })

  mockInvokeAsync.mockReturnValueOnce({
    promise: async () => Promise.resolve()
  })
})

afterEach(() => {
  mockInvoke.mockClear()
  mockInvokeAsync.mockClear()
  CorrelationIds.clearAll()
})

const verifyInvokeWithCorrelationIds = async (funcName, correlationIds) => {
  const payload = {
    userId: 'theburningmonk'
  }

  const params = {
    FunctionName: funcName,
    InvocationType: 'Event',
    Payload: JSON.stringify(payload)
  }
  await Lambda.invoke(params).promise()

  const expectedPayload = Object.assign(
    {}, 
    payload, 
    { __context__: correlationIds }
  )

  expect(mockInvoke).toBeCalled()
  const [actualParams, _] = mockInvoke.mock.calls[0]
  expect(actualParams.FunctionName).toBe(funcName)
  expect(actualParams.InvocationType).toBe('Event')
  expect(JSON.parse(actualParams.Payload)).toEqual(expectedPayload)
}

const verifyInvokeAsyncWithCorrelationIds = async (funcName, correlationIds) => {
  const payload = {
    userId: 'theburningmonk'    
  }

  const params = {
    FunctionName: funcName,
    InvokeArgs: JSON.stringify(payload)
  }
  await Lambda.invokeAsync(params).promise()

  const expectedPayload = Object.assign({}, payload, { __context__: correlationIds })

  expect(mockInvokeAsync).toBeCalled()
  const [actualParams, _] = mockInvokeAsync.mock.calls[0]
  expect(actualParams.FunctionName).toBe(funcName)
  expect(JSON.parse(actualParams.InvokeArgs)).toEqual(expectedPayload)
}

describe('invoke', () => {
  test('When there are no correlation IDs, __context__ is empty', async () => {
    await verifyInvokeWithCorrelationIds('no-context', {})
  })
  
  test('Correlation IDs are forwarded in a __context__ field', async () => {
    const correlationIds = {
      'x-correlation-id': 'id',
      'debug-log-enabled': 'true'
    }
    CorrelationIds.replaceAllWith(correlationIds)

    await verifyInvokeWithCorrelationIds('with-context', correlationIds)
  })

  test('When payload is not JSON, request is not modified', async () => {
    const params = {
      FunctionName: 'not-json',
      InvocationType: 'Event',
      Payload: 'dGhpcyBpcyBub3QgSlNPTg=='
    }

    await Lambda.invoke(params).promise()

    expect(mockInvoke).toBeCalledWith(params, undefined)
  })
})

describe('invoke async', () => {
  test('When there are no correlation IDs, __context__ is empty', async () => {
    await verifyInvokeAsyncWithCorrelationIds('no-context', {})
  })
  
  test('Correlation IDs are forwarded in a __context__ field', async () => {
    const correlationIds = {
      'x-correlation-id': 'id',
      'debug-log-enabled': 'true'
    }
    CorrelationIds.replaceAllWith(correlationIds)

    await verifyInvokeAsyncWithCorrelationIds('with-context', correlationIds)
  })

  test('When payload is not JSON, request is not modified', async () => {
    const params = {
      FunctionName: 'not-json',
      InvokeArgs: 'dGhpcyBpcyBub3QgSlNPTg=='
    }

    await Lambda.invokeAsync(params).promise()

    expect(mockInvokeAsync).toBeCalledWith(params, undefined)
  })
})