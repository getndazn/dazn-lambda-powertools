const AWS = require('aws-sdk')

global.console.log = jest.fn()

const mockSendMessage = jest.fn()
const mockSendMessageBatch = jest.fn()
AWS.SQS.prototype.sendMessage = mockSendMessage
AWS.SQS.prototype.sendMessageBatch = mockSendMessageBatch

const SQS = require('../index')
const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')

beforeEach(() => {
  mockSendMessage.mockReturnValueOnce({
    promise: async () => Promise.resolve()
  })
  mockSendMessageBatch.mockReturnValueOnce({
    promise: async () => Promise.resolve()
  })
})

afterEach(() => {
  mockSendMessage.mockClear()
  mockSendMessageBatch.mockClear()
  CorrelationIds.clearAll()
})

describe('SQS client', () => {
  describe('.sendMessage', () => {
    const verifySendMessage = async (attributes) => {
      const params = {
        MessageBody: 'test',
        QueueUrl: 'queue-url'
      }
      await SQS.sendMessage(params).promise()

      expect(mockSendMessage).toBeCalledWith({
        MessageBody: 'test',
        QueueUrl: 'queue-url',
        MessageAttributes: attributes
      })
    }

    describe('when there are no correlationIds', () => {
      it('sends empty MessageAttributes', async () => {
        await verifySendMessage({})
      })
    })

    describe('when there are global correlationIds', () => {
      it('forwards them in MessageAttributes', async () => {
        CorrelationIds.replaceAllWith({
          'x-correlation-id': 'id',
          'debug-log-enabled': 'true',
          'call-chain-length': 1
        })

        await verifySendMessage({
          'x-correlation-id': {
            DataType: 'String',
            StringValue: 'id'
          },
          'debug-log-enabled': {
            DataType: 'String',
            StringValue: 'true'
          },
          'call-chain-length': {
            DataType: 'String',
            StringValue: '1'
          }
        })
      })
    })
  })

  describe('.sendMessageWithCorrelationIds', () => {
    const verifySendMessageWithCorrelationIds = async (correlationIds, attributes) => {
      const params = {
        MessageBody: 'test',
        QueueUrl: 'queue-url'
      }
      await SQS.sendMessageWithCorrelationIds(correlationIds, params).promise()

      expect(mockSendMessage).toBeCalledWith({
        MessageBody: 'test',
        QueueUrl: 'queue-url',
        MessageAttributes: attributes
      })
    }
    it('forwards given correlationIds in MessageAttributes field', async () => {
      const correlationIds = new CorrelationIds({
        'x-correlation-id': 'child-id',
        'debug-log-enabled': 'true',
        'call-chain-length': 1
      })

      await verifySendMessageWithCorrelationIds(correlationIds, {
        'x-correlation-id': {
          DataType: 'String',
          StringValue: 'child-id'
        },
        'debug-log-enabled': {
          DataType: 'String',
          StringValue: 'true'
        },
        'call-chain-length': {
          DataType: 'String',
          StringValue: '1'
        }
      })
    })
  })

  describe('.sendMessageBatch', () => {
    const verifySendMessageBatch = async (attributes) => {
      const params = {
        Entries: [
          { Id: '1', MessageBody: 'test-1' },
          { Id: '2', MessageBody: 'test-2' }
        ],
        QueueUrl: 'queue-url'
      }
      await SQS.sendMessageBatch(params).promise()

      expect(mockSendMessageBatch).toBeCalledWith({
        Entries: [
          { Id: '1', MessageBody: 'test-1', MessageAttributes: attributes },
          { Id: '2', MessageBody: 'test-2', MessageAttributes: attributes }
        ],
        QueueUrl: 'queue-url'
      })
    }

    describe('when there are no correlationIds', () => {
      it('sends empty MessageAttributes', async () => {
        await verifySendMessageBatch({})
      })
    })

    describe('when there are global correlationIds', () => {
      it('forwards them in MessageAttributes', async () => {
        CorrelationIds.replaceAllWith({
          'x-correlation-id': 'id',
          'debug-log-enabled': 'true'
        })

        await verifySendMessageBatch({
          'x-correlation-id': {
            DataType: 'String',
            StringValue: 'id'
          },
          'debug-log-enabled': {
            DataType: 'String',
            StringValue: 'true'
          }
        })
      })
    })
  })

  describe('.sendMessageBatchWithCorrelationIds', () => {
    const verifySendMessageBatchWithCorrelationIds = async (correlationIds, attributes) => {
      const params = {
        Entries: [
          { Id: '1', MessageBody: 'test-1' },
          { Id: '2', MessageBody: 'test-2' }
        ],
        QueueUrl: 'queue-url'
      }
      await SQS.sendMessageBatchWithCorrelationIds(correlationIds, params).promise()

      expect(mockSendMessageBatch).toBeCalledWith({
        Entries: [
          { Id: '1', MessageBody: 'test-1', MessageAttributes: attributes },
          { Id: '2', MessageBody: 'test-2', MessageAttributes: attributes }
        ],
        QueueUrl: 'queue-url'
      })
    }

    it('forwards given correlationIds in MessageAttributes field', async () => {
      const correlationIds = new CorrelationIds({
        'x-correlation-id': 'id',
        'debug-log-enabled': 'true'
      })

      await verifySendMessageBatchWithCorrelationIds(correlationIds, {
        'x-correlation-id': {
          DataType: 'String',
          StringValue: 'id'
        },
        'debug-log-enabled': {
          DataType: 'String',
          StringValue: 'true'
        }
      })
    })
  })
})
