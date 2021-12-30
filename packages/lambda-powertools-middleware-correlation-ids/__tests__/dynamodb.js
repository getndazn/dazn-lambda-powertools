const _ = require("lodash");
const uuid = require("uuid/v4");
const middy = require("@middy/core");
const dynamoDbClient = require("aws-sdk/clients/dynamodb");
const CorrelationIds = require("@buyerassist/dazn-lambda-powertools-correlation-ids");
const captureCorrelationIds = require("../index");

global.console.log = jest.fn();

const invokeDynamoHandler = async (
  event,
  awsRequestId,
  sampleDebugLogRate,
  handlerF,
  recordF
) => {
  const handler = middy(async (event, context) => {
    // check the correlation IDs outside the context of a record are correct
    handlerF(CorrelationIds.get());

    context.parsedDynamoDbEvents.forEach((evt) => {
      recordF(evt);
    });

    // check the correlation IDs outside the context of a record are correct
    handlerF(CorrelationIds.get());
  });
  handler.use(captureCorrelationIds({ sampleDebugLogRate }));

  await handler(event, { awsRequestId });
};

const dynamo = require("./event-templates/dynamo-new-old.json");
const genDynamoEvent = (correlationIDs = {}) => {
  const event = _.cloneDeep(dynamo);

  const data = {
    __context__: correlationIDs,
  };

  const record = event.Records[0];

  const unmarshalledNewImage = dynamoDbClient.Converter.unmarshall(
    record.dynamodb.NewImage
  );
  const newImage = Object.assign(unmarshalledNewImage, data);
  record.dynamodb.NewImage = dynamoDbClient.Converter.marshall(newImage);

  return event;
};

const genDynamoEventWithoutNewImage = () => {
  const event = _.cloneDeep(dynamo);
  const record = event.Records[0];
  delete record.dynamodb.NewImage;

  return event;
};

const dynamoTests = () => {
  describe("when sampleDebugLogRate = 0", () => {
    it("always sets debug-log-enabled to false", async () => {
      const requestId = uuid();
      await invokeDynamoHandler(
        genDynamoEvent(),
        requestId,
        0,
        (x) => {
          expect(x["awsRequestId"]).toBe(requestId);
          expect(x["debug-log-enabled"]).toBe("false");
        },
        (record) => {
          const x = record.correlationIds.get();
          expect(x["awsRequestId"]).toBe(requestId);
          expect(x["debug-log-enabled"]).toBe("false");
        }
      );
    });
  });

  describe("when event lacks NewImage", () => {
    it("should set default correlation id", async () => {
      const requestId = uuid();
      await invokeDynamoHandler(
        genDynamoEventWithoutNewImage(),
        requestId,
        0,
        (x) => {
          expect(x["awsRequestId"]).toBe(requestId);
          expect(x["debug-log-enabled"]).toBe("false");
        },
        (record) => {
          const x = record.correlationIds.get();
          // correlation IDs at the record level should just take from the handler
          expect(x["x-correlation-id"]).toBe(requestId);
          expect(x["awsRequestId"]).toBe(requestId);
        }
      );
    });
  });

  describe("when sampleDebugLogRate = 1", () => {
    it("always sets debug-log-enabled to true", async () => {
      const requestId = uuid();
      await invokeDynamoHandler(
        genDynamoEvent(),
        requestId,
        1,
        (x) => {
          expect(x["awsRequestId"]).toBe(requestId);
          expect(x["debug-log-enabled"]).toBe("true");
        },
        (record) => {
          const x = record.correlationIds.get();
          expect(x["awsRequestId"]).toBe(requestId);
          expect(x["debug-log-enabled"]).toBe("true");
        }
      );
    });
  });

  describe("when correlation ID is not provided in the event", () => {
    it("sets it to the AWS Request ID", async () => {
      const requestId = uuid();
      await invokeDynamoHandler(
        genDynamoEvent(),
        requestId,
        0,
        (x) => {
          // correlation IDs at the handler level
          expect(x["x-correlation-id"]).toBe(requestId);
          expect(x["awsRequestId"]).toBe(requestId);
        },
        (record) => {
          const x = record.correlationIds.get();
          // correlation IDs at the record level should just take from the handler
          expect(x["x-correlation-id"]).toBe(requestId);
          expect(x["awsRequestId"]).toBe(requestId);
        }
      );
    });
  });

  describe("when call-chain-length is not provided in the event", () => {
    it("sets it to 1", async () => {
      const requestId = uuid();
      await invokeDynamoHandler(
        genDynamoEvent(),
        requestId,
        0,
        (x) => {}, // n/a
        (record) => {
          const x = record.correlationIds.get();
          expect(x["call-chain-length"]).toBe(1);
        }
      );
    });
  });

  describe("when correlation IDs are provided in the event", () => {
    let handlerCorrelationIds;
    let record;
    let id;
    let userId;
    let requestId;

    beforeEach(async () => {
      id = uuid();
      userId = uuid();

      const correlationIds = {
        "x-correlation-id": id,
        "x-correlation-user-id": userId,
        "User-Agent": "jest test",
        "debug-log-enabled": "true",
      };

      const event = genDynamoEvent(correlationIds);
      requestId = uuid();
      await invokeDynamoHandler(
        event,
        requestId,
        0,
        (x) => {
          handlerCorrelationIds = x;
        },
        (aRecord) => {
          record = aRecord;
        }
      );
    });

    it("still has the correct handler correlation IDs", () => {
      expect(handlerCorrelationIds["x-correlation-id"]).toBe(requestId);
      expect(handlerCorrelationIds["awsRequestId"]).toBe(requestId);
    });

    it("captures them on the record", () => {
      const x = record.correlationIds.get();
      // correlation IDs at the record level should match what was passed in
      expect(x["x-correlation-id"]).toBe(id);
      expect(x["x-correlation-user-id"]).toBe(userId);
      expect(x["User-Agent"]).toBe("jest test");
      expect(x["debug-log-enabled"]).toBe("true");
      expect(x["awsRequestId"]).toBe(requestId);
    });

    it("sets correlationIds as a non-enumerable property", () => {
      expect(record).toHaveProperty("correlationIds");
      expect(record.propertyIsEnumerable("correlationIds")).toBe(false);
    });

    it("sets logger as a non-enumerable property", () => {
      expect(record).toHaveProperty("logger");
      expect(record.propertyIsEnumerable("logger")).toBe(false);
      expect(record.logger.correlationIds).toBe(record.correlationIds);
    });
  });

  describe("when correlation IDs are provided in the event", () => {
    let record;
    let id;

    beforeEach(async () => {
      id = uuid();

      const correlationIds = {
        "x-correlation-id": id,
        "call-chain-length": 1,
      };

      const event = genDynamoEvent(correlationIds);
      await invokeDynamoHandler(
        event,
        uuid(),
        0,
        () => {},
        (aRecord) => {
          record = aRecord;
        }
      );
    });

    it("increments it by 1", () => {
      const x = record.correlationIds.get();
      expect(x["call-chain-length"]).toBe(2);
    });
  });
};

describe("Correlation IDs middleware (Dynamo)", () => {
  dynamoTests();
});
