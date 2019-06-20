const AWS = require('aws-sdk')

const mockPutRecord = jest.fn()
const mockPutRecords = jest.fn()
AWS.Kinesis.prototype.putRecord = mockPutRecord
AWS.Kinesis.prototype.putRecords = mockPutRecords

global.console.log = jest.fn()

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

const verifyPutRecordWithCorrelationIdsContext = async (correlationIds, f) => {
  const data = JSON.stringify({
    eventType: 'wrote_test',
    username: 'theburningmonk'
  })
  const params = {
    Data: data,
    StreamName: 'test'
  }
  await Kinesis.putRecordWithCorrelationIds(correlationIds, params).promise()

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

const verifyPutRecordsWithCorrelationIdsContext = async (correlationIds, f) => {
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
  await Kinesis.putRecordsWithCorrelationIds(correlationIds, params).promise()

  expect(mockPutRecords).toBeCalled()
  const actualParams = mockPutRecords.mock.calls[0][0]
  actualParams.Records.forEach(record => {
    const actualData = JSON.parse(record.Data)
    f(actualData.__context__)
  })
}

describe('Kinesis client', () => {
  describe('.putRecord', () => {
    describe('when there are no correlation IDs', () => {
      it('sends empty __context__ ', async () => {
        await verifyPutRecordContext(x => expect(x).toEqual({}))
      })
    })

    describe('when there are global correlationIds', () => {
      it('forwards them in __context__', async () => {
        const correlationIds = {
          'x-correlation-id': 'id',
          'debug-log-enabled': 'true'
        }
        CorrelationIds.replaceAllWith(correlationIds)

        await verifyPutRecordContext(x => {
          expect(x).toEqual({
            'x-correlation-id': 'id',
            'debug-log-enabled': 'true'
          })
        })
      })
    })

    describe('when payload is not JSON', () => {
      it('does not modify the request', async () => {
        const params = {
          Data: 'dGhpcyBpcyBub3QgSlNPTg==',
          StreamName: 'test'
        }
        await Kinesis.putRecord(params).promise()

        expect(mockPutRecord).toBeCalledWith(params)
      })
    })

    describe('when payload is binary', () => {
      it('does not modify the request', async () => {
        const params = {
          StreamName: 'test',
          Data: Buffer.from('dGhpcyBpcyBub3QgSlNPTg==', 'base64')
        }

        await Kinesis.putRecord(params).promise()

        expect(mockPutRecord).toBeCalledWith(params)
      })
    })
  })

  describe('.putRecordWithCorrelationIds', () => {
    it('forwards given correlationIds in __context__ field', async () => {
      const correlationIds = new CorrelationIds({
        'x-correlation-id': 'child-id',
        'debug-log-enabled': 'true'
      })

      await verifyPutRecordWithCorrelationIdsContext(correlationIds, x => {
        expect(x).toEqual({
          'x-correlation-id': 'child-id',
          'debug-log-enabled': 'true'
        })
      })
    })
  })

  describe('.putRecords', () => {
    describe('when there are no correlation IDs', () => {
      it('sends empty __context__ ', async () => {
        await verifyPutRecordsContext(x => expect(x).toEqual({}))
      })
    })

    describe('when there are global correlationIds', () => {
      it('forwards them in __context__', async () => {
        const correlationIds = {
          'x-correlation-id': 'id',
          'debug-log-enabled': 'true'
        }
        CorrelationIds.replaceAllWith(correlationIds)

        await verifyPutRecordsContext(x => {
          expect(x).toEqual({
            'x-correlation-id': 'id',
            'debug-log-enabled': 'true'
          })
        })
      })
    })

    describe('when payload is not JSON', () => {
      it('does not modify the request', async () => {
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
    })

    describe('when payload is binary', () => {
      it('does not modify the request', async () => {
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
  })

  describe('.putRecordsWithCorrelationIds', () => {
    it('forwards given correlationIds in __context__ field', async () => {
      const correlationIds = new CorrelationIds({
        'x-correlation-id': 'child-id',
        'debug-log-enabled': 'true'
      })

      await verifyPutRecordsWithCorrelationIdsContext(correlationIds, x => {
        expect(x).toEqual({
          'x-correlation-id': 'child-id',
          'debug-log-enabled': 'true'
        })
      })
    })
  })
})
