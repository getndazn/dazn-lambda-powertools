const AWS = require('aws-sdk')

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

describe('SendMessage', () => {
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

  test('When there are no correlation IDs, MessageAttributes is empty', async () => {
    await verifySendMessage({})
  })

  test('Correlation IDs are forwarded in MessageAttributes', async () => {
    CorrelationIds.replaceAllWith({
      'x-correlation-id': 'id',
      'debug-log-enabled': 'true'
    })

    await verifySendMessage({
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

describe('SendMessageBatch', () => {
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

  test('When there are no correlation IDs, MessageAttributes is empty', async () => {
    await verifySendMessageBatch({})
  })

  test('Correlation IDs are forwarded in MessageAttributes', async () => {
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
