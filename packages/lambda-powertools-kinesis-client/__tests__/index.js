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
})

afterEach(() => {
  mockPutRecord.mockClear()
  mockPutRecords.mockClear()

  CorrelationIds.clearAll()
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
  const actualParams = mockPutRecord.mock.calls[0][0]
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
  const actualParams = mockPutRecords.mock.calls[0][0]
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
      'debug-log-enabled': 'true'
    })

    await verifyPutRecordContext(x => {
      expect(x['x-correlation-id']).toBe('id')
      expect(x['debug-log-enabled']).toBe('true')
    })
  })

  test('When payload is not JSON, request is not modified', async () => {
    const params = {
      Data: 'dGhpcyBpcyBub3QgSlNPTg==',
      StreamName: 'test'
    }
    await Kinesis.putRecord(params).promise()

    expect(mockPutRecord).toBeCalledWith(params)
  })
})

describe('PutRecords', () => {
  test('When there are no correlation IDs, an empty __context__ is added to JSON payload', async () => {
    await verifyPutRecordsContext(x => expect(x).toEqual({}))
  })

  test("When there are correlation IDs, they're forwarded in a __context__ property added to JSON payload", async () => {
    CorrelationIds.replaceAllWith({
      'x-correlation-id': 'id',
      'debug-log-enabled': 'true'
    })

    await verifyPutRecordsContext(x => {
      expect(x['x-correlation-id']).toBe('id')
      expect(x['debug-log-enabled']).toBe('true')
    })
  })

  test('When payloads are not JSON, request is not modified', async () => {
    const params = {
      Records: [
        { Data: 'dGhpcyBpcyBub3QgSlNPTg==' },
        { Data: 'dGhpcyBpcyBhbHNvIG5vdCBKU09O' },
        { Data: 'c29ycnksIHN0aWxsIG5vdCBKU09O' }
      ],
      StreamName: 'test'
    }
    await Kinesis.putRecords(params).promise()

    expect(mockPutRecords).toBeCalledWith(params)
  })

  test('When payloads are binary, request is not modified', async () => {
    const params = {
      Records: [
        { Data: Buffer.from('dGhpcyBpcyBub3QgSlNPTg==', 'base64') },
        { Data: Buffer.from('dGhpcyBpcyBhbHNvIG5vdCBKU09O', 'base64') },
        { Data: Buffer.from('c29ycnksIHN0aWxsIG5vdCBKU09O', 'base64') }
      ],
      StreamName: 'test'
    }
    await Kinesis.putRecords(params).promise()

    expect(mockPutRecords).toBeCalledWith(params)
  })
})
