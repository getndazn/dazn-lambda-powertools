const AWS = require('aws-sdk')

const mockPublish = jest.fn()
AWS.SNS.prototype.publish = mockPublish

const SNS = require('../index')
const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')

beforeEach(() => {
  mockPublish.mockReturnValueOnce({
    promise: async () => Promise.resolve()
  })

  CorrelationIds.clearAll()
})

afterEach(mockPublish.mockReset)

test('When there are no correlation IDs, MessageAttributes is empty', async () => {  
  const params = {
    Message: 'test',
    TopicArn: 'topic-arn'
  }
  await SNS.publish(params).promise()

  expect(mockPublish).toBeCalledWith({
    Message: 'test',
    TopicArn: 'topic-arn',
    MessageAttributes: {}
  }, undefined)
})

test('Correlation IDs are forwarded in MessageAttributes', async () => {
  CorrelationIds.replaceAllWith({
    'x-correlation-id': 'id',
    'Debug-Log-Enabled': 'true'
  })

  const params = {
    Message: 'test',
    TopicArn: 'topic-arn'
  }
  await SNS.publish(params).promise()

  expect(mockPublish).toBeCalledWith({
    Message: 'test',
    TopicArn: 'topic-arn',
    MessageAttributes: {
      'x-correlation-id': {
        DataType: 'String',
        StringValue: 'id'
      },
      'Debug-Log-Enabled': {
        DataType: 'String',
        StringValue: 'true'
      }
    }
  }, undefined)
})