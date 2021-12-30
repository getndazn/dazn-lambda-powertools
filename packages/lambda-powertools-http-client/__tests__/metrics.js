const nock = require("nock");

// spy on https.request to see when it's actually called
const http = require("https");
const mockRequest = jest.spyOn(http, "request");

// mock the metrics module to check if they're invoked
const Metrics = require("@dazn/datadog-metrics");

global.console.log = jest.fn();

const mockHistogram = jest.fn();
Metrics.histogram = mockHistogram;
const mockIncrement = jest.fn();
Metrics.increment = mockIncrement;

const region = "us-east-1";
const funcName = "test-function";
const funcVersion = "$LATEST";
const url = "https://theburningmonk.com";

process.env.AWS_REGION = region;
process.env.AWS_LAMBDA_FUNCTION_NAME = funcName;
process.env.AWS_LAMBDA_FUNCTION_VERSION = funcVersion;

const Req = require("../index");

afterEach(() => {
  mockRequest.mockClear();
  mockHistogram.mockClear();
  mockIncrement.mockClear();
});

afterAll(mockRequest.mockRestore);

const successReq = async (metricName = null) => {
  nock(url).get("/").reply(200);

  const options = {
    uri: url,
    method: "GET",
  };
  if (metricName) {
    options.metricName = metricName;
  }
  await Req(options);

  expect(mockRequest).toBeCalled();
};

const failedReq = async (metricName = null) => {
  nock(url).get("/").reply(500, { test: true });

  const options = {
    uri: url,
    method: "GET",
  };
  if (metricName) {
    options.metricName = metricName;
  }

  await Req(
    options
    // eslint-disable-next-line handle-callback-err
  ).catch((err) => {
    // swallow the exception, we're only interested in the side-effects
    // of recording the metrics
  });

  expect(mockRequest).toBeCalled();
};

const verifyTags = (tags, statusCode = 200) => {
  expect(tags).toContainEqual(`awsRegion:${region}`);
  expect(tags).toContainEqual(`functionName:${funcName}`);
  expect(tags).toContainEqual(`functionVersion:${funcVersion}`);
  expect(tags).toContainEqual(`method:GET`);
  expect(tags).toContainEqual(`path:/`);
  expect(tags).toContainEqual(`statusCode:${statusCode}`);
};

describe("HTTP client (metrics)", () => {
  describe("when the request is successful", () => {
    beforeEach(async () => {
      await successReq();
    });
    it("records custom histogram metric", () => {
      expect(mockHistogram).toBeCalled();
      const [key, value, tags] = mockHistogram.mock.calls[0];
      expect(key).toBe("theburningmonk.com.response.latency");
      expect(value).toBeLessThan(500); // come on, no way it'll be higher than this with Nock

      verifyTags(tags);
    });

    it("records custom count metric", () => {
      expect(mockIncrement).toBeCalled();
      const [key, value, tags] = mockIncrement.mock.calls[0];
      expect(key).toBe("theburningmonk.com.response.200");
      expect(value).toBe(1);

      verifyTags(tags);
    });
  });

  describe("when the request fails", () => {
    beforeEach(async () => {
      await failedReq();
    });

    it("records custom histogram metric", () => {
      expect(mockHistogram).toBeCalled();
      const [key, value, tags] = mockHistogram.mock.calls[0];
      expect(key).toBe("theburningmonk.com.response.latency");
      expect(value).toBeLessThan(500); // come on, no way it'll be higher than this with Nock

      verifyTags(tags, 500);
    });

    it("records custom count metric", () => {
      expect(mockIncrement).toBeCalled();
      const [key, value, tags] = mockIncrement.mock.calls[0];
      expect(key).toBe("theburningmonk.com.response.500");
      expect(value).toBe(1);

      verifyTags(tags, 500);
    });
  });

  describe("when the request is successful with custom metricName", () => {
    beforeEach(async () => {
      await successReq("custom");
    });
    it("records custom histogram metric", () => {
      expect(mockHistogram).toBeCalled();
      const [key, value, tags] = mockHistogram.mock.calls[0];
      expect(key).toBe("custom.latency");
      expect(value).toBeLessThan(500); // come on, no way it'll be higher than this with Nock

      verifyTags(tags);
    });

    it("records custom count metric", () => {
      expect(mockIncrement).toBeCalled();
      const [key, value, tags] = mockIncrement.mock.calls[0];
      expect(key).toBe("custom.200");
      expect(value).toBe(1);

      verifyTags(tags);
    });
  });

  describe("when the request fails with custom metricName", () => {
    beforeEach(async () => {
      await failedReq("custom");
    });

    it("records custom histogram metric", () => {
      expect(mockHistogram).toBeCalled();
      const [key, value, tags] = mockHistogram.mock.calls[0];
      expect(key).toBe("custom.latency");
      expect(value).toBeLessThan(500); // come on, no way it'll be higher than this with Nock

      verifyTags(tags, 500);
    });

    it("records custom count metric", () => {
      expect(mockIncrement).toBeCalled();
      const [key, value, tags] = mockIncrement.mock.calls[0];
      expect(key).toBe("custom.500");
      expect(value).toBe(1);

      verifyTags(tags, 500);
    });
  });
});
