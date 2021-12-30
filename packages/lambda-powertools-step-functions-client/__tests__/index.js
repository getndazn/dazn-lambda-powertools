const AWS = require("aws-sdk");

global.console.log = jest.fn();

const mockStartExecution = jest.fn();
AWS.StepFunctions.prototype.startExecution = mockStartExecution;

const SFN = require("../index");
const CorrelationIds = require("@buyerassist/dazn-lambda-powertools-correlation-ids");

beforeEach(() => {
  mockStartExecution.mockReturnValueOnce({
    promise: async () => Promise.resolve(),
  });
});

afterEach(() => {
  mockStartExecution.mockClear();
  CorrelationIds.clearAll();
});

describe("Step functions client", () => {
  describe(".startExecution", () => {
    describe("when there are no correlationIds", () => {
      it("sends an empty __context__", async () => {
        const input = {
          userId: "theburningmonk",
        };

        const params = {
          stateMachineArn: "sfn-arn",
          input: JSON.stringify(input),
          name: "no-context",
        };
        await SFN.startExecution(params).promise();

        const expectedInput = Object.assign({}, input, { __context__: {} });

        expect(mockStartExecution).toBeCalled();
        const actualParams = mockStartExecution.mock.calls[0][0];
        expect(actualParams.stateMachineArn).toBe("sfn-arn");
        expect(actualParams.name).toBe("no-context");
        expect(JSON.parse(actualParams.input)).toEqual(expectedInput);
      });
    });

    describe("when there are global correlationIds", () => {
      it("forwards them in __context__ field", async () => {
        CorrelationIds.replaceAllWith({
          "x-correlation-id": "id",
          "debug-log-enabled": "true",
        });

        const input = {
          userId: "theburningmonk",
        };

        const params = {
          stateMachineArn: "sfn-arn",
          input: JSON.stringify(input),
          name: "has-context",
        };
        await SFN.startExecution(params).promise();

        const expectedInput = Object.assign({}, input, {
          __context__: {
            "x-correlation-id": "id",
            "debug-log-enabled": "true",
          },
        });

        expect(mockStartExecution).toBeCalled();
        const actualParams = mockStartExecution.mock.calls[0][0];
        expect(actualParams.stateMachineArn).toBe("sfn-arn");
        expect(actualParams.name).toBe("has-context");
        expect(JSON.parse(actualParams.input)).toEqual(expectedInput);
      });
    });

    describe("when payload is not JSON", () => {
      it("does not modify the request", async () => {
        const params = {
          stateMachineArn: "sfn-arn",
          input: "dGhpcyBpcyBub3QgSlNPTg==",
          name: "not-json",
        };
        await SFN.startExecution(params).promise();

        expect(mockStartExecution).toBeCalledWith(params);
      });
    });
  });

  describe(".startExecutionWithCorrelationIds", () => {
    it("forwards given correlationIds in __context__ field", async () => {
      const correlationIds = new CorrelationIds({
        "x-correlation-id": "child-id",
        "debug-log-enabled": "true",
      });

      const input = {
        userId: "theburningmonk",
      };

      const params = {
        stateMachineArn: "sfn-arn",
        input: JSON.stringify(input),
        name: "has-context-child",
      };
      await SFN.startExecutionWithCorrelationIds(
        correlationIds,
        params
      ).promise();

      const expectedInput = Object.assign({}, input, {
        __context__: {
          "x-correlation-id": "child-id",
          "debug-log-enabled": "true",
        },
      });

      expect(mockStartExecution).toBeCalled();
      const actualParams = mockStartExecution.mock.calls[0][0];
      expect(actualParams.stateMachineArn).toBe("sfn-arn");
      expect(actualParams.name).toBe("has-context-child");
      expect(JSON.parse(actualParams.input)).toEqual(expectedInput);
    });
  });
});
