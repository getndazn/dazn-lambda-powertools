const AWS = require("aws-sdk");

const mockInvoke = jest.fn();
const mockInvokeAsync = jest.fn();
AWS.Lambda.prototype.invoke = mockInvoke;
AWS.Lambda.prototype.invokeAsync = mockInvokeAsync;

const Lambda = require("../index");
const CorrelationIds = require("@buyerassist/dazn-lambda-powertools-correlation-ids");

global.console.log = jest.fn();

beforeEach(() => {
  mockInvoke.mockReturnValueOnce({
    promise: async () => Promise.resolve(),
  });

  mockInvokeAsync.mockReturnValueOnce({
    promise: async () => Promise.resolve(),
  });
});

afterEach(() => {
  mockInvoke.mockClear();
  mockInvokeAsync.mockClear();
  CorrelationIds.clearAll();
});

const verifyInvoke = async (funcName, correlationIds) => {
  const payload = {
    userId: "theburningmonk",
  };

  const params = {
    FunctionName: funcName,
    InvocationType: "Event",
    Payload: JSON.stringify(payload),
  };
  await Lambda.invoke(params).promise();

  const expectedPayload = Object.assign({}, payload, {
    __context__: correlationIds,
  });

  expect(mockInvoke).toBeCalled();
  const actualParams = mockInvoke.mock.calls[0][0];
  expect(actualParams.FunctionName).toBe(funcName);
  expect(actualParams.InvocationType).toBe("Event");
  expect(JSON.parse(actualParams.Payload)).toEqual(expectedPayload);
};

const verifyInvokeWithCorrelationIds = async (funcName, correlationIds) => {
  const payload = {
    userId: "theburningmonk",
  };

  const params = {
    FunctionName: funcName,
    InvocationType: "Event",
    Payload: JSON.stringify(payload),
  };
  await Lambda.invokeWithCorrelationIds(correlationIds, params).promise();

  const expectedPayload = Object.assign({}, payload, {
    __context__: correlationIds.get(),
  });

  expect(mockInvoke).toBeCalled();
  const actualParams = mockInvoke.mock.calls[0][0];
  expect(actualParams.FunctionName).toBe(funcName);
  expect(actualParams.InvocationType).toBe("Event");
  expect(JSON.parse(actualParams.Payload)).toEqual(expectedPayload);
};

const verifyInvokeAsync = async (funcName, correlationIds) => {
  const payload = {
    userId: "theburningmonk",
  };

  const params = {
    FunctionName: funcName,
    InvokeArgs: JSON.stringify(payload),
  };
  await Lambda.invokeAsync(params).promise();

  const expectedPayload = Object.assign({}, payload, {
    __context__: correlationIds,
  });

  expect(mockInvokeAsync).toBeCalled();
  const actualParams = mockInvokeAsync.mock.calls[0][0];
  expect(actualParams.FunctionName).toBe(funcName);
  expect(JSON.parse(actualParams.InvokeArgs)).toEqual(expectedPayload);
};

const verifyInvokeAsyncWithCorrelationIds = async (
  funcName,
  correlationIds
) => {
  const payload = {
    userId: "theburningmonk",
  };

  const params = {
    FunctionName: funcName,
    InvokeArgs: JSON.stringify(payload),
  };
  await Lambda.invokeAsyncWithCorrelationIds(correlationIds, params).promise();

  const expectedPayload = Object.assign({}, payload, {
    __context__: correlationIds.get(),
  });

  expect(mockInvokeAsync).toBeCalled();
  const actualParams = mockInvokeAsync.mock.calls[0][0];
  expect(actualParams.FunctionName).toBe(funcName);
  expect(JSON.parse(actualParams.InvokeArgs)).toEqual(expectedPayload);
};

describe("Lambda client", () => {
  describe(".invoke", () => {
    describe("when there are no correlation IDs", () => {
      it("sends empty __context__ ", async () => {
        await verifyInvoke("no-context", {});
      });
    });

    describe("when there are global correlationIds", () => {
      it("forwards them in __context__", async () => {
        const correlationIds = {
          "x-correlation-id": "id",
          "debug-log-enabled": "true",
        };
        CorrelationIds.replaceAllWith(correlationIds);

        await verifyInvoke("with-context", correlationIds);
      });
    });

    describe("when payload is not JSON", () => {
      it("does not modify the request", async () => {
        const params = {
          FunctionName: "not-json",
          InvocationType: "Event",
          Payload: "dGhpcyBpcyBub3QgSlNPTg==",
        };

        await Lambda.invoke(params).promise();

        expect(mockInvoke).toBeCalledWith(params);
      });
    });

    describe("when payload is binary", () => {
      it("does not modify the request", async () => {
        const params = {
          FunctionName: "binary",
          InvocationType: "Event",
          Payload: Buffer.from("dGhpcyBpcyBub3QgSlNPTg==", "base64"),
        };

        await Lambda.invoke(params).promise();

        expect(mockInvoke).toBeCalledWith(params);
      });
    });
  });

  describe(".invokeWithCorrelationIds", () => {
    it("forwards given correlationIds in __context__ field", async () => {
      const correlationIds = new CorrelationIds({
        "x-correlation-id": "child-id",
        "debug-log-enabled": "true",
      });

      await verifyInvokeWithCorrelationIds(
        "with-context-correlation",
        correlationIds
      );
    });
  });

  describe(".invokeAsync", () => {
    describe("when there are no correlation IDs", () => {
      it("sends empty __context__ ", async () => {
        await verifyInvokeAsync("no-context", {});
      });
    });

    describe("when there are global correlationIds", () => {
      it("forwards them in __context__", async () => {
        const correlationIds = {
          "x-correlation-id": "id",
          "debug-log-enabled": "true",
        };
        CorrelationIds.replaceAllWith(correlationIds);

        await verifyInvokeAsync("with-context", correlationIds);
      });
    });

    describe("when payload is not JSON", () => {
      it("does not modify the request", async () => {
        const params = {
          FunctionName: "not-json",
          InvokeArgs: "dGhpcyBpcyBub3QgSlNPTg==",
        };

        await Lambda.invokeAsync(params).promise();

        expect(mockInvokeAsync).toBeCalledWith(params);
      });
    });

    describe("when payload is binary", () => {
      it("does not modify the request", async () => {
        const params = {
          FunctionName: "binary",
          InvokeArgs: Buffer.from("dGhpcyBpcyBub3QgSlNPTg==", "base64"),
        };

        await Lambda.invokeAsync(params).promise();

        expect(mockInvokeAsync).toBeCalledWith(params);
      });
    });
  });

  describe(".invokeAsyncWithCorrelationIds", () => {
    it("forwards given correlationIds in __context__ field", async () => {
      const correlationIds = new CorrelationIds({
        "x-correlation-id": "child-id",
        "debug-log-enabled": "true",
      });

      await verifyInvokeAsyncWithCorrelationIds(
        "with-context-correlation",
        correlationIds
      );
    });
  });
});
