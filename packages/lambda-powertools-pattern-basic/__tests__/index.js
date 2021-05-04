const MockImplementation = () => {
  return {
    before: async (request) => { }
  }
}

const SampleLogging = jest.fn()
// eslint-disable-next-line no-unused-vars
const MockSampleLogging = jest.mock(
  '@dazn/lambda-powertools-middleware-sample-logging',
  () => { return SampleLogging.mockImplementation(MockImplementation) }
)

const CaptureCorrelationIds = jest.fn()
// eslint-disable-next-line no-unused-vars
const MockCaptureCorrelationIds = jest.mock(
  '@dazn/lambda-powertools-middleware-correlation-ids',
  () => { return CaptureCorrelationIds.mockImplementation(MockImplementation) }
)

afterEach(() => {
  delete process.env.SAMPLE_DEBUG_LOG_RATE

  SampleLogging.mockClear()
  CaptureCorrelationIds.mockClear()
})

// const LogTimeout = require('@dazn/lambda-powertools-middleware-log-timeout')

describe('basic pattern', () => {
  describe('when there are no overrides', () => {
    it('should set sample debug log rate to 0.01', async () => {
      const wrap = require('../index')
      const handler = wrap(async () => { })
      await handler({}, {})
      expect(CaptureCorrelationIds).toHaveBeenCalledWith({ sampleDebugLogRate: 0.01 })
      expect(SampleLogging).toHaveBeenCalledWith({ sampleRate: 0.01 })
    })
  })

  describe('when there is an override for sample debug log rate', () => {
    beforeAll(() => {
      process.env.SAMPLE_DEBUG_LOG_RATE = '0.03'
    })

    it('should set sample debug log rate to 0.03', async () => {
      const wrap = require('../index')
      const handler = wrap(async () => { })
      await handler({}, {})
      expect(CaptureCorrelationIds).toHaveBeenCalledWith({ sampleDebugLogRate: 0.03 })
      expect(SampleLogging).toHaveBeenCalledWith({ sampleRate: 0.03 })
    })
  })

  describe('override DATADOG_PREFIX if not defined', () => {
    const funcName = 'lambda-powertools-func'

    beforeAll(() => {
      process.env.AWS_LAMBDA_FUNCTION_NAME = funcName
      delete process.env.DATADOG_PREFIX
      jest.resetModules()
    })

    afterAll(() => {
      delete process.env.DATADOG_PREFIX
      delete process.env.AWS_LAMBDA_FUNCTION_NAME
    })

    it('should override DATADOG_PREFIX not defined', () => {
      require('../index')
      expect(process.env.DATADOG_PREFIX).toBe(funcName + '.')
    })

    it('should NOT override DATADOG_PREFIX if defined', () => {
      process.env.DATADOG_PREFIX = ''
      require('../index')
      expect(process.env.DATADOG_PREFIX).toStrictEqual('')
    })
  })
})
