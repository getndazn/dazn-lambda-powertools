const AWS = require('aws-sdk')

const mockPutRecord = jest.fn()
const mockPutRecordBatch = jest.fn()
AWS.Firehose.prototype.putRecord = mockPutRecord
AWS.Firehose.prototype.putRecordBatch = mockPutRecordBatch

global.console.log = jest.fn()

const Firehose = require('../index')
const CorrelationIds = require('@dazn/lambda-powertools-correlation-ids')

beforeEach(() => {
  mockPutRecord.mockReturnValueOnce({
    promise: async () => Promise.resolve()
  })

  mockPutRecordBatch.mockReturnValueOnce({
    promise: async () => Promise.resolve()
  })
})

afterEach(() => {
  mockPutRecord.mockClear()
  mockPutRecordBatch.mockClear()

  CorrelationIds.clearAll()
})

const verifyPutRecordContext = async (f) => {
  const data = JSON.stringify({
    eventType: 'wrote_test',
    username: 'theburningmonk'
  })
  const params = {
    Record: {
      Data: data
    },
    DeliveryStreamName: 'test'
  }
  await Firehose.putRecord(params).promise()

  expect(mockPutRecord).toBeCalled()
  const actualParams = mockPutRecord.mock.calls[0][0]
  const actualData = JSON.parse(actualParams.Record.Data)
  f(actualData.__context__)
}

const verifyPutRecordWithCorrelationIdsContext = async (correlationIds, f) => {
  const data = JSON.stringify({
    eventType: 'wrote_test',
    username: 'theburningmonk'
  })
  const params = {
    Record: {
      Data: data
    },
    DeliveryStreamName: 'test'
  }
  await Firehose.putRecordWithCorrelationIds(correlationIds, params).promise()

  expect(mockPutRecord).toBeCalled()
  const actualParams = mockPutRecord.mock.calls[0][0]
  const actualData = JSON.parse(actualParams.Record.Data)
  f(actualData.__context__)
}

const verifyPutRecordBatchContext = async (f) => {
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
    DeliveryStreamName: 'test'
  }
  await Firehose.putRecordBatch(params).promise()

  expect(mockPutRecordBatch).toBeCalled()
  const actualParams = mockPutRecordBatch.mock.calls[0][0]
  actualParams.Records.forEach(record => {
    const actualData = JSON.parse(record.Data)
    f(actualData.__context__)
  })
}

const verifyPutRecordBatchWithCorrelationIdsContext = async (correlationIds, f) => {
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
    DeliveryStreamName: 'test'
  }
  await Firehose.putRecordBatchWithCorrelationIds(correlationIds, params).promise()

  expect(mockPutRecordBatch).toBeCalled()
  const actualParams = mockPutRecordBatch.mock.calls[0][0]
  actualParams.Records.forEach(record => {
    const actualData = JSON.parse(record.Data)
    f(actualData.__context__)
  })
}

describe('Firehose client', () => {
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
          Record: {
            Data: 'dGhpcyBpcyBub3QgSlNPTg=='
          },
          DeliveryStreamName: 'test'
        }
        await Firehose.putRecord(params).promise()

        expect(mockPutRecord).toBeCalledWith(params)
      })
    })

    describe('when payload is binary', () => {
      it('does not modify the request', async () => {
        const params = {
          DeliveryStreamName: 'test',
          Record: {
            Data: Buffer.from('dGhpcyBpcyBub3QgSlNPTg==', 'base64')
          }
        }

        await Firehose.putRecord(params).promise()

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

  describe('.putRecordBatch', () => {
    describe('when there are no correlation IDs', () => {
      it('sends empty __context__ ', async () => {
        await verifyPutRecordBatchContext(x => expect(x).toEqual({}))
      })
    })

    describe('when there are global correlationIds', () => {
      it('forwards them in __context__', async () => {
        const correlationIds = {
          'x-correlation-id': 'id',
          'debug-log-enabled': 'true'
        }
        CorrelationIds.replaceAllWith(correlationIds)

        await verifyPutRecordBatchContext(x => {
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
          DeliveryStreamName: 'test'
        }
        await Firehose.putRecordBatch(params).promise()

        expect(mockPutRecordBatch).toBeCalledWith(params)
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
          DeliveryStreamName: 'test'
        }
        await Firehose.putRecordBatch(params).promise()

        expect(mockPutRecordBatch).toBeCalledWith(params)
      })
    })
  })

  describe('.putRecordBatchWithCorrelationIds', () => {
    it('forwards given correlationIds in __context__ field', async () => {
      const correlationIds = new CorrelationIds({
        'x-correlation-id': 'child-id',
        'debug-log-enabled': 'true'
      })

      await verifyPutRecordBatchWithCorrelationIdsContext(correlationIds, x => {
        expect(x).toEqual({
          'x-correlation-id': 'child-id',
          'debug-log-enabled': 'true'
        })
      })
    })
  })
})
