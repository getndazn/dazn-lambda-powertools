const AWS = require('aws-sdk')

const mockPut = jest.fn()
const mockUpdate = jest.fn()
const mockBatchWrite = jest.fn()
const mockTransactWrite = jest.fn()
AWS.DynamoDB.DocumentClient.prototype.put = mockPut
AWS.DynamoDB.DocumentClient.prototype.update = mockUpdate
AWS.DynamoDB.DocumentClient.prototype.batchWrite = mockBatchWrite
AWS.DynamoDB.DocumentClient.prototype.transactWrite = mockTransactWrite

const DynamoDB = require('../index')
const CorrelationIds = require('@dazn/lambda-powertools-correlation-ids')

global.console.log = jest.fn()

beforeEach(() => {
  mockPut.mockReturnValueOnce({
    promise: async () => Promise.resolve()
  })

  mockUpdate.mockReturnValueOnce({
    promise: async () => Promise.resolve()
  })

  mockBatchWrite.mockReturnValueOnce({
    promise: async () => Promise.resolve()
  })

  mockTransactWrite.mockReturnValueOnce({
    promise: async () => Promise.resolve()
  })
})

afterEach(() => {
  mockPut.mockReset()
  mockUpdate.mockReset()
  mockBatchWrite.mockReset()
  mockTransactWrite.mockReset()
  CorrelationIds.clearAll()
})

describe('DynamoDB client', () => {
  describe('.put', () => {
    describe('when there are no correlation IDs', () => {
      it('sends empty __context__', async () => {
        await verifyPut({})
      })
    })

    describe('when there are global correlationIds', () => {
      it('forwards them in __context__', async () => {
        const correlationIds = {
          'x-correlation-id': 'id',
          'debug-log-enabled': 'true'
        }
        CorrelationIds.replaceAllWith(correlationIds)
        await verifyPut(correlationIds)
      })
    })
  })

  describe('.putWithCorrelationIds', () => {
    it('forwards given correlationIds in __context__ field', async () => {
      const correlationIds = new CorrelationIds({
        'x-correlation-id': 'child-id',
        'debug-log-enabled': 'true'
      })

      await verifyPutWithCorrelationIds(correlationIds)
    })
  })

  describe('.update', () => {
    describe('when there are no correlation IDs', () => {
      it('sends empty __context__', async () => {
        const input = {
          expr: 'SET #count = :count',
          names: { '#count': 'count' },
          values: { ':count': 1 }
        }
        const expectations = {
          expr: 'SET #count = :count, #LambdaPowertoolsContext = :LambdaPowertoolsContext',
          names: { '#count': 'count', '#LambdaPowertoolsContext': '__context__' },
          values: { ':count': 1, ':LambdaPowertoolsContext': {} }
        }
        await verifyUpdate(input, expectations)
      })
    })

    describe('when there are no SET expression', () => {
      it('is added to the UpdateExpression', async () => {
        const input = {
          expr: 'REMOVE #age',
          names: { '#age': 'age' },
          values: { }
        }
        const expectations = {
          expr: 'REMOVE #age SET #LambdaPowertoolsContext = :LambdaPowertoolsContext',
          names: { '#age': 'age', '#LambdaPowertoolsContext': '__context__' },
          values: { ':LambdaPowertoolsContext': {} }
        }
        await verifyUpdate(input, expectations)
      })
    })

    describe('when there are global correlationIds', () => {
      it('forwards them in __context__', async () => {
        const correlationIds = {
          'x-correlation-id': 'id',
          'debug-log-enabled': 'true'
        }
        CorrelationIds.replaceAllWith(correlationIds)

        const input = {
          expr: 'SET #count = :count',
          names: { '#count': 'count' },
          values: { ':count': 1 }
        }
        const expectations = {
          expr: 'SET #count = :count, #LambdaPowertoolsContext = :LambdaPowertoolsContext',
          names: { '#count': 'count', '#LambdaPowertoolsContext': '__context__' },
          values: { ':count': 1, ':LambdaPowertoolsContext': correlationIds }
        }
        await verifyUpdate(input, expectations)
      })
    })
  })

  describe('.updateWithCorrelationIds', () => {
    it('forwards given correlationIds in __context__ field', async () => {
      const correlationIds = new CorrelationIds({
        'x-correlation-id': 'child-id',
        'debug-log-enabled': 'true'
      })

      const input = {
        expr: 'SET #count = :count',
        names: { '#count': 'count' },
        values: { ':count': 1 }
      }
      const expectations = {
        expr: 'SET #count = :count, #LambdaPowertoolsContext = :LambdaPowertoolsContext',
        names: { '#count': 'count', '#LambdaPowertoolsContext': '__context__' },
        values: { ':count': 1, ':LambdaPowertoolsContext': correlationIds.get() }
      }
      await verifyUpdateWithCorrelationIds(correlationIds, input, expectations)
    })
  })

  describe('.batchWrite', () => {
    describe('when there are no correlation IDs', () => {
      it('sends empty __context__', async () => {
        await verifyBatchWrite({})
      })
    })

    describe('when there are global correlationIds', () => {
      it('forwards them in __context__', async () => {
        const correlationIds = {
          'x-correlation-id': 'id',
          'debug-log-enabled': 'true'
        }
        CorrelationIds.replaceAllWith(correlationIds)
        await verifyBatchWrite(correlationIds)
      })
    })
  })

  describe('.batchWriteWithCorrelationIds', () => {
    it('forwards given correlationIds in __context__ field', async () => {
      const correlationIds = new CorrelationIds({
        'x-correlation-id': 'child-id',
        'debug-log-enabled': 'true'
      })

      await verifyBatchWriteWithCorrelationIds(correlationIds)
    })
  })

  describe('.transactWrite', () => {
    describe('when there are no correlation IDs', () => {
      it('sends empty __context__', async () => {
        const input = {
          expr: 'SET #count = :count',
          names: { '#count': 'count' },
          values: { ':count': 1 }
        }
        const expectations = {
          expr: 'SET #count = :count, #LambdaPowertoolsContext = :LambdaPowertoolsContext',
          names: { '#count': 'count', '#LambdaPowertoolsContext': '__context__' },
          values: { ':count': 1, ':LambdaPowertoolsContext': {} }
        }
        await verifyTransactWrite({}, input, expectations)
      })
    })

    describe('when there are global correlationIds', () => {
      it('forwards them in __context__', async () => {
        const correlationIds = {
          'x-correlation-id': 'id',
          'debug-log-enabled': 'true'
        }
        CorrelationIds.replaceAllWith(correlationIds)

        const input = {
          expr: 'SET #count = :count',
          names: { '#count': 'count' },
          values: { ':count': 1 }
        }
        const expectations = {
          expr: 'SET #count = :count, #LambdaPowertoolsContext = :LambdaPowertoolsContext',
          names: { '#count': 'count', '#LambdaPowertoolsContext': '__context__' },
          values: { ':count': 1, ':LambdaPowertoolsContext': correlationIds }
        }
        await verifyTransactWrite(correlationIds, input, expectations)
      })
    })
  })

  describe('.transactWriteWithCorrelationIds', () => {
    it('forwards given correlationIds in __context__ field', async () => {
      const correlationIds = new CorrelationIds({
        'x-correlation-id': 'child-id',
        'debug-log-enabled': 'true'
      })

      const input = {
        expr: 'SET #count = :count',
        names: { '#count': 'count' },
        values: { ':count': 1 }
      }
      const expectations = {
        expr: 'SET #count = :count, #LambdaPowertoolsContext = :LambdaPowertoolsContext',
        names: { '#count': 'count', '#LambdaPowertoolsContext': '__context__' },
        values: { ':count': 1, ':LambdaPowertoolsContext': correlationIds.get() }
      }
      await verifyTransactWriteWithCorrelationIds(correlationIds, input, expectations)
    })
  })
})

const tableName = 'my-table'

async function verifyPut (correlationIds) {
  const item = {
    name: 'yan',
    url: 'https://theburningmonk.com'
  }

  const params = {
    TableName: tableName,
    Item: item
  }
  await DynamoDB.put(params).promise()

  const expectedItem = Object.assign(
    {},
    item,
    { __context__: correlationIds }
  )

  expect(mockPut).toBeCalled()
  const actualParams = mockPut.mock.calls[0][0]
  expect(actualParams.TableName).toBe(tableName)
  expect(actualParams.Item).toEqual(expectedItem)
}

async function verifyPutWithCorrelationIds (correlationIds) {
  const item = {
    name: 'yan',
    url: 'https://theburningmonk.com'
  }

  const params = {
    TableName: tableName,
    Item: item
  }
  await DynamoDB.putWithCorrelationIds(correlationIds, params).promise()

  const expectedItem = Object.assign(
    {},
    item,
    { __context__: correlationIds.get() }
  )

  expect(mockPut).toBeCalled()
  const actualParams = mockPut.mock.calls[0][0]
  expect(actualParams.TableName).toBe(tableName)
  expect(actualParams.Item).toEqual(expectedItem)
}

async function verifyUpdate (input, expectations) {
  const params = {
    TableName: tableName,
    Key: { Id: 'theburningmonk' },
    UpdateExpression: input.expr,
    ExpressionAttributeNames: input.names,
    ExpressionAttributeValues: input.values
  }
  await DynamoDB.update(params).promise()

  expect(mockUpdate).toBeCalled()
  const actualParams = mockUpdate.mock.calls[0][0]
  expect(actualParams.TableName).toBe(tableName)
  expect(actualParams.Key).toEqual({ Id: 'theburningmonk' })
  expect(actualParams.UpdateExpression).toBe(expectations.expr)
  expect(actualParams.ExpressionAttributeNames).toEqual(expectations.names)
  expect(actualParams.ExpressionAttributeValues).toEqual(expectations.values)
}

async function verifyUpdateWithCorrelationIds (correlationIds, input, expectations) {
  const params = {
    TableName: tableName,
    Key: { Id: 'theburningmonk' },
    UpdateExpression: input.expr,
    ExpressionAttributeNames: input.names,
    ExpressionAttributeValues: input.values
  }
  await DynamoDB.updateWithCorrelationIds(correlationIds, params).promise()

  expect(mockUpdate).toBeCalled()
  const actualParams = mockUpdate.mock.calls[0][0]
  expect(actualParams.TableName).toBe(tableName)
  expect(actualParams.Key).toEqual({ Id: 'theburningmonk' })
  expect(actualParams.UpdateExpression).toBe(expectations.expr)
  expect(actualParams.ExpressionAttributeNames).toEqual(expectations.names)
  expect(actualParams.ExpressionAttributeValues).toEqual(expectations.values)
}

async function verifyBatchWrite (correlationIds) {
  const item = {
    name: 'yan',
    url: 'https://theburningmonk.com'
  }

  const params = {
    RequestItems: {
      [tableName]: [
        {
          DeleteRequest: {
            Key: { Id: 'cui' }
          }
        },
        {
          PutRequest: {
            Item: item
          }
        }
      ]
    }
  }
  await DynamoDB.batchWrite(params).promise()

  const expectedItem = Object.assign(
    {},
    item,
    { __context__: correlationIds }
  )

  expect(mockBatchWrite).toBeCalled()
  const actualParams = mockBatchWrite.mock.calls[0][0]
  expect(actualParams.RequestItems[tableName]).toHaveLength(2)
  expect(actualParams.RequestItems[tableName][0]).toEqual({
    DeleteRequest: {
      Key: { Id: 'cui' }
    }
  })
  expect(actualParams.RequestItems[tableName][1]).toEqual({
    PutRequest: {
      Item: expectedItem
    }
  })
}

async function verifyBatchWriteWithCorrelationIds (correlationIds) {
  const item = {
    name: 'yan',
    url: 'https://theburningmonk.com'
  }

  const params = {
    RequestItems: {
      [tableName]: [
        {
          DeleteRequest: {
            Key: { Id: 'cui' }
          }
        },
        {
          PutRequest: {
            Item: item
          }
        }
      ]
    }
  }
  await DynamoDB.batchWriteWithCorrelationIds(correlationIds, params).promise()

  const expectedItem = Object.assign(
    {},
    item,
    { __context__: correlationIds.get() }
  )

  expect(mockBatchWrite).toBeCalled()
  const actualParams = mockBatchWrite.mock.calls[0][0]
  expect(actualParams.RequestItems[tableName]).toHaveLength(2)
  expect(actualParams.RequestItems[tableName][0]).toEqual({
    DeleteRequest: { Key: { Id: 'cui' } }
  })
  expect(actualParams.RequestItems[tableName][1]).toEqual({
    PutRequest: { Item: expectedItem }
  })
}

async function verifyTransactWrite (correlationIds, input, expectations) {
  const item = {
    name: 'yan',
    url: 'https://theburningmonk.com'
  }

  const params = {
    TransactItems: [
      {
        Put: {
          TableName: tableName,
          Item: item
        }
      },
      {
        Update: {
          TableName: tableName,
          Key: { Id: 'theburningmonk' },
          UpdateExpression: input.expr,
          ExpressionAttributeNames: input.names,
          ExpressionAttributeValues: input.values
        }
      }
    ]
  }
  await DynamoDB.transactWrite(params).promise()

  const expectedItem = Object.assign(
    {},
    item,
    { __context__: correlationIds }
  )

  expect(mockTransactWrite).toBeCalled()
  const actualParams = mockTransactWrite.mock.calls[0][0]
  expect(actualParams.TransactItems).toHaveLength(2)

  expect(actualParams.TransactItems[0]).toEqual({
    Put: {
      TableName: tableName,
      Item: expectedItem
    }
  })

  const updateReq = actualParams.TransactItems[1].Update
  expect(updateReq.TableName).toBe(tableName)
  expect(updateReq.Key).toEqual({ Id: 'theburningmonk' })
  expect(updateReq.UpdateExpression).toBe(expectations.expr)
  expect(updateReq.ExpressionAttributeNames).toEqual(expectations.names)
  expect(updateReq.ExpressionAttributeValues).toEqual(expectations.values)
}

async function verifyTransactWriteWithCorrelationIds (correlationIds, input, expectations) {
  const item = {
    name: 'yan',
    url: 'https://theburningmonk.com'
  }

  const params = {
    TransactItems: [
      {
        Put: {
          TableName: tableName,
          Item: item
        }
      },
      {
        Update: {
          TableName: tableName,
          Key: { Id: 'theburningmonk' },
          UpdateExpression: input.expr,
          ExpressionAttributeNames: input.names,
          ExpressionAttributeValues: input.values
        }
      }
    ]
  }
  await DynamoDB.transactWriteWithCorrelationIds(correlationIds, params).promise()

  const expectedItem = Object.assign(
    {},
    item,
    { __context__: correlationIds.get() }
  )

  expect(mockTransactWrite).toBeCalled()
  const actualParams = mockTransactWrite.mock.calls[0][0]
  expect(actualParams.TransactItems).toHaveLength(2)

  expect(actualParams.TransactItems[0]).toEqual({
    Put: {
      TableName: tableName,
      Item: expectedItem
    }
  })

  const updateReq = actualParams.TransactItems[1].Update
  expect(updateReq.TableName).toBe(tableName)
  expect(updateReq.Key).toEqual({ Id: 'theburningmonk' })
  expect(updateReq.UpdateExpression).toBe(expectations.expr)
  expect(updateReq.ExpressionAttributeNames).toEqual(expectations.names)
  expect(updateReq.ExpressionAttributeValues).toEqual(expectations.values)
}
