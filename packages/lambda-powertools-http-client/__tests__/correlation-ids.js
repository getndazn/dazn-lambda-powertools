const CorrelationIds = require("@buyerassist/dazn-lambda-powertools-correlation-ids");
const nock = require("nock");

// spy on https.request to see when it's actually called
const http = require("https");
const mockRequest = jest.spyOn(http, "request");

global.console.log = jest.fn();

const Req = require("../index");

beforeEach(mockRequest.mockClear);

afterEach(CorrelationIds.clearAll);

afterAll(mockRequest.mockRestore);

const verifyHeaders = async (userHeaders, f, correlationIds) => {
  const url = "https://theburningmonk.com";
  nock(url).get("/").reply(200);

  await Req({
    uri: url,
    method: "GET",
    headers: userHeaders,
    correlationIds,
  });

  expect(mockRequest).toBeCalled();

  // inspect the ClientRequest object returned for the HTTP headers we'll send
  // see https://nodejs.org/docs/latest-v8.x/api/http.html#http_class_http_clientrequest

  const result = mockRequest.mock.results[0];

  const clientReq = result.value;
  const headers = clientReq.headers;

  f(headers);
};

describe("HTTP client (correlationIds)", () => {
  describe("when there are no correlationIds", () => {
    it("does not add anything to HTTP headers", async () => {
      await verifyHeaders({}, (headers) => {
        expect(headers["x-correlation-id"]).toBeUndefined();
        expect(headers["x-correlation-user-id"]).toBeUndefined();
      });
    });
  });

  describe("when there are global correlationIds", () => {
    it("forwards them as HTTP headers", async () => {
      CorrelationIds.set("id", "id");
      CorrelationIds.set("user-id", "theburningmonk");

      await verifyHeaders({}, (headers) => {
        expect(headers["x-correlation-id"]).toBe("id");
        expect(headers["x-correlation-user-id"]).toBe("theburningmonk");
      });
    });

    describe("when there are also user-specified headers", () => {
      it("does not affect them", async () => {
        CorrelationIds.set("id", "id");
        CorrelationIds.set("user-id", "theburningmonk");

        const userHeaders = {
          "order-id": "order-id",
        };

        await verifyHeaders(userHeaders, (headers) => {
          expect(headers["order-id"]).toBe("order-id");
        });
      });
    });

    describe("when there are user-specified correlation ID headers", () => {
      it("does not override them", async () => {
        CorrelationIds.set("id", "id");
        CorrelationIds.set("user-id", "theburningmonk");

        const userHeaders = {
          "x-correlation-id": "user-id", // this should override what we set with the CorrelationIds module
        };

        await verifyHeaders(userHeaders, (headers) => {
          expect(headers["x-correlation-id"]).toBe("user-id");
          expect(headers["x-correlation-user-id"]).toBe("theburningmonk");
        });
      });
    });

    describe("when there are null or undefined correlation IDs", () => {
      it("does not add them to HTTP headers", async () => {
        CorrelationIds.replaceAllWith({
          awsRequestId: undefined,
          awsRegion: null,
          "x-correlation-id": "theburningmonk",
        });

        await verifyHeaders({ zero: 0 }, (headers) => {
          expect(headers["x-correlation-id"]).toBe("theburningmonk");
          expect(headers["zero"]).toBe(0);
          const headerKeys = Object.keys(headers);
          expect(headerKeys).not.toContain("awsRequestId");
          expect(headerKeys).not.toContain("awsRegion");
        });
      });
    });
  });

  describe("when the correlationIds option is provided", () => {
    it("forwards them as HTTP headers instead of the global ones", async () => {
      CorrelationIds.set("id", "id");

      const correlationIds = new CorrelationIds({
        "x-correlation-id": "child-id",
        "debug-log-enabled": "true",
      });

      await verifyHeaders(
        {},
        (headers) => {
          expect(headers["x-correlation-id"]).toBe("child-id");
          expect(headers["debug-log-enabled"]).toBe("true");
        },
        correlationIds
      );
    });
  });
});
