const AWS = require("aws-sdk");

global.console.log = jest.fn();

const mockPublish = jest.fn();
const mockPublishBatch = jest.fn();
AWS.SNS.prototype.publish = mockPublish;
AWS.SNS.prototype.publishBatch = mockPublishBatch;

const SNS = require("../index");
const CorrelationIds = require("@buyerassist/dazn-lambda-powertools-correlation-ids");

beforeEach(() => {
  mockPublish.mockReturnValueOnce({
    promise: async () => Promise.resolve(),
  });
  mockPublishBatch.mockReturnValueOnce({
    promise: async () => Promise.resolve(),
  });
});

afterEach(() => {
  mockPublish.mockClear();
  mockPublishBatch.mockClear();
  CorrelationIds.clearAll();
});

describe("SNS client", () => {
  describe(".publish", () => {
    describe("when there are no correlationIds", () => {
      it("sends empty MessageAttributes", async () => {
        const params = {
          Message: "test",
          TopicArn: "topic-arn",
        };
        await SNS.publish(params).promise();

        expect(mockPublish).toBeCalledWith({
          Message: "test",
          TopicArn: "topic-arn",
          MessageAttributes: {},
        });
      });
    });

    describe("when there are global correlationIds", () => {
      it("forwards them in MessageAttributes", async () => {
        CorrelationIds.replaceAllWith({
          "x-correlation-id": "id",
          "debug-log-enabled": "true",
          "call-chain-length": 1,
        });

        const params = {
          Message: "test",
          TopicArn: "topic-arn",
        };
        await SNS.publish(params).promise();

        expect(mockPublish).toBeCalledWith({
          Message: "test",
          TopicArn: "topic-arn",
          MessageAttributes: {
            "x-correlation-id": {
              DataType: "String",
              StringValue: "id",
            },
            "debug-log-enabled": {
              DataType: "String",
              StringValue: "true",
            },
            "call-chain-length": {
              DataType: "String",
              StringValue: "1",
            },
          },
        });
      });
    });
  });

  describe(".publishWithCorrelationIds", () => {
    it("forwards given correlationIds in MessageAttributes field", async () => {
      const correlationIds = new CorrelationIds({
        "x-correlation-id": "child-id",
        "debug-log-enabled": "true",
        "call-chain-length": 1,
      });

      const params = {
        Message: "test",
        TopicArn: "topic-arn",
      };
      await SNS.publishWithCorrelationIds(correlationIds, params).promise();

      expect(mockPublish).toBeCalledWith({
        Message: "test",
        TopicArn: "topic-arn",
        MessageAttributes: {
          "x-correlation-id": {
            DataType: "String",
            StringValue: "child-id",
          },
          "debug-log-enabled": {
            DataType: "String",
            StringValue: "true",
          },
          "call-chain-length": {
            DataType: "String",
            StringValue: "1",
          },
        },
      });
    });
  });

  describe(".publishBatch", () => {
    describe("when there are no correlationIds", () => {
      it("sends empty MessageAttributes", async () => {
        const params = {
          PublishBatchRequestEntries: [{
            Message: "test",
            Id: "1"
          }],
          TopicArn: "topic-arn",
        };
        await SNS.publishBatch(params).promise();

        expect(mockPublishBatch).toBeCalledWith({
          PublishBatchRequestEntries:  [{
            Message: "test",
            Id: "1",
            MessageAttributes: {}
          }],
          TopicArn: "topic-arn",
        });
      });
    });

    describe("when there are global correlationIds", () => {
      it("forwards them in MessageAttributes", async () => {
        CorrelationIds.replaceAllWith({
          "x-correlation-id": "id",
          "debug-log-enabled": "true",
          "call-chain-length": 1,
        });

        const params = {
          PublishBatchRequestEntries: [{
            Message: "test",
            Id: "1"
          }],
          TopicArn: "topic-arn",
        };
        await SNS.publishBatch(params).promise();

        expect(mockPublishBatch).toBeCalledWith({
          PublishBatchRequestEntries: 
            [{
              Id: "1", 
              Message: "test",
              MessageAttributes: {"call-chain-length": {"DataType": "String", "StringValue": "1"}, "debug-log-enabled": {"DataType": "String", "StringValue": "true"}, "x-correlation-id": {"DataType": "String", "StringValue": "id"}}
            }], 
          TopicArn: "topic-arn"
        });
      });
    });
  });
});
