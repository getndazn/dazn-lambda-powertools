const AWS = require('aws-sdk')

const mockPutRecord = jest.fn()
const mockPutRecords = jest.fn()
AWS.Kinesis.prototype.putRecord = mockPutRecord
AWS.Kinesis.prototype.putRecords = mockPutRecords

const Kinesis = require('../index')
const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')

beforeEach(() => {
  mockPutRecord.mockReturnValueOnce({
    promise: async () => Promise.resolve()
  })

  mockPutRecords.mockReturnValueOnce({
    promise: async () => Promise.resolve()
  })

  CorrelationIds.clearAll()
})

afterEach(() => {
  mockPutRecord.mockReset()
  mockPutRecords.mockReset()
})

const verifyPutRecordContext = async (f) => {
  const data = JSON.stringify({ 
    eventType: 'wrote_test',
    username: 'theburningmonk'
  })
  const params = {
    Data: data,
    StreamName: 'test'
  }
  await Kinesis.putRecord(params).promise()

  expect(mockPutRecord).toBeCalled()
  const [ actualParams, _ ] = mockPutRecord.mock.calls[0]
  const actualData = JSON.parse(actualParams.Data)
  f(actualData.__context__)
}

const verifyPutRecordsContext = async (f) => {
  const eventTypes = [
    'wrote_test',
    'ran_test',
    'pass_test'
  ]
  const records = eventTypes
    .map(eventType => {
      const data = { eventType, username: 'theburningmonk' }
      return {
        Data: JSON.stringify(data)
      }
    })
  const params = {
    Records: records,
    StreamName: 'test'
  }
  await Kinesis.putRecords(params).promise()

  expect(mockPutRecords).toBeCalled()
  const [ actualParams, _ ] = mockPutRecords.mock.calls[0]
  actualParams.Records.forEach(record => {
    const actualData = JSON.parse(record.Data)
    f(actualData.__context__)
  })
}

describe('PutRecord', () => {
  test('When there are no correlation IDs, an empty __context__ is added to JSON payload', async () => {  
    await verifyPutRecordContext(x => expect(x).toEqual({}))
  })
  
  test("When there are correlation IDs, they're forwarded in a __context__ property added to JSON payload", async () => {
    CorrelationIds.replaceAllWith({
      'x-correlation-id': 'id',
      'Debug-Log-Enabled': 'true'
    })
  
    await verifyPutRecordContext(x => {
      expect(x['x-correlation-id']).toBe('id')
      expect(x['Debug-Log-Enabled']).toBe('true')
    })
  })
})

describe('PutRecords', () => {
  test('When there are no correlation IDs, an empty __context__ is added to JSON payload', async () => {  
    await verifyPutRecordsContext(x => expect(x).toEqual({}))
  })
  
  test("When there are correlation IDs, they're forwarded in a __context__ property added to JSON payload", async () => {
    CorrelationIds.replaceAllWith({
      'x-correlation-id': 'id',
      'Debug-Log-Enabled': 'true'
    })
  
    await verifyPutRecordsContext(x => {
      expect(x['x-correlation-id']).toBe('id')
      expect(x['Debug-Log-Enabled']).toBe('true')
    })
  })
})