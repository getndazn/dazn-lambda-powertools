const consoleLog = jest.spyOn(global.console, 'log')

const Log = require('@perform/lambda-powertools-logger')
const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')

const middy = require('middy')
const sampleLogMiddleware = require('../index')

beforeEach(() => {
  process.env.LOG_LEVEL = 'INFO'
  CorrelationIds.clearAll()
  consoleLog.mockClear()
})

const invokeSuccessHandler = (sampleRate) => {
  const handler = middy((event, context, cb) => {
    Log.debug('test')
    cb(null)
  })
  handler.use(sampleLogMiddleware({ sampleRate }))

  handler({}, { awsRequestId: 'test-id' }, (err, result) => {})
}

const invokeFailureHandler = (event, awsRequestId, sampleRate, obfuscationFilters = []) => {
  const handler = middy((event, context, cb) => {
    throw new Error('boom')
  })
  handler.use(sampleLogMiddleware({ sampleRate, obfuscationFilters }))

  handler(event, { awsRequestId }, (err, result) => {})
}

const debugLogWasEnabled = () => {
  expect(consoleLog).toBeCalled()
  const log = JSON.parse(consoleLog.mock.calls[0])
  expect(log.message).toBe('test')
  expect(log.sLevel).toBe('DEBUG')
  expect(log.level).toBe(20)
}

const errorLogWasWritten = (f) => {
  expect(consoleLog).toBeCalled()
  const log = JSON.parse(consoleLog.mock.calls[0])
  expect(log.sLevel).toBe('ERROR')
  expect(log.level).toBe(50)
  expect(log.message).toBe('invocation failed')

  f(log)
}

test("when 'debug-log-enabled' is 'true', debug log should be enabled", () => {
  CorrelationIds.replaceAllWith({ 'debug-log-enabled': 'true' })

  invokeSuccessHandler(0)
  debugLogWasEnabled()
})

test('when sample rate is 0%, debug log is not enabled', () => {
  invokeSuccessHandler(0)
  expect(consoleLog).not.toBeCalled()
})

test('when sample rate is 100%, debug log is definitely enabled', () => {
  invokeSuccessHandler(1)
  debugLogWasEnabled()
})

test('when an invocation errors, an error log is always written', () => {
  const event = { test: 'wat' }
  const awsRequestId = 'test-id'

  invokeFailureHandler(event, awsRequestId)
  errorLogWasWritten(x => {
    expect(x.errorName).toBe('Error')
    expect(x.errorMessage).toBe('boom')
    expect(x.stackTrace).not.toBeFalsy()
    expect(x.awsRequestId).toBe(awsRequestId)
    expect(x.invocationEvent).toBeDefined()
  })  
})

test ('should obfuscate events using the filter', () => { 
  const event = { test: 'wat' };
  const awsRequestId = 'test-id'

  invokeFailureHandler(event, awsRequestId, 0.01, ["test"])
  errorLogWasWritten(x => {
    const json = JSON.parse(x.invocationEvent);
    expect(json.test).toEqual('******');
  });
})

test ('should obfuscate events with arrays using the filter', () => { 
  const event = { test: [ { foo: 'wat' }, {foo: 'bar'} ] };
  const awsRequestId = 'test-id'

  invokeFailureHandler(event, awsRequestId, 0.01, ["test.*.foo"])
  errorLogWasWritten(x => {
    const json = JSON.parse(x.invocationEvent);
    expect(json.test[0].foo).toEqual('******');
    expect(json.test[1].foo).toEqual('******');
  });
})

test ('should obfuscate events with multipleArrays arrays using the filter', () => { 
  const event = { test: [ { foo: { bar: [ {baz: 'heyo' } ] } }, { foo: { bar: [ {baz: 'hey' } ] } } ] };
  const awsRequestId = 'test-id'

  invokeFailureHandler(event, awsRequestId, 0.01, ["test.*.foo.bar.*.baz"])
  errorLogWasWritten(x => {
    const json = JSON.parse(x.invocationEvent);
    expect(json.test[0].foo.bar[0].baz[0]).toEqual('******');
  });
})

test ('should obfuscate every field on an object using the filter', () => {
  const event = { test: [ { foo: { bar: [ {baz: { bloop: { blah: "Please Obfuscate Me"} } } ] } }, { foo: { bar: [ {baz: 'hey' } ] } } ] };
  const awsRequestId = 'test-id'

  invokeFailureHandler(event, awsRequestId, 0.01, ["test.*.foo"])
  errorLogWasWritten(x => {
    const json = JSON.parse(x.invocationEvent);
    expect(json.test[0].foo.bar[0].baz.bloop.blah).toEqual('******');
  });
})

test ('should not filter fields that dont exist', () => {
  const event = { test: { foo: { bar: { buzz: "Nope" }}}};
  const awsRequestId = 'test-id'

  invokeFailureHandler(event, awsRequestId, 0.01, ["test.foo.bar.boop"])
  errorLogWasWritten(x => {
    const json = JSON.parse(x.invocationEvent);
    expect(json).toEqual(event);
  });
})

test ('should not filter fields that dont exist with arrays', () => {
  const event = { test: { foo: { bar: [{ buzz: "Nope" }]}}};
  const awsRequestId = 'test-id'

  invokeFailureHandler(event, awsRequestId, 0.01, ["test.foo.bar.*.blap"])
  errorLogWasWritten(x => {
    const json = JSON.parse(x.invocationEvent);
    expect(json).toEqual(event);
  });
})

test ('should not filter when nothing passed', () => {
  const event = { test: { foo: { bar: [{ buzz: "Nope" }]}}};
  const awsRequestId = 'test-id'

  invokeFailureHandler(event, awsRequestId, 0.01, [])
  errorLogWasWritten(x => {
    const json = JSON.parse(x.invocationEvent);
    expect(json).toEqual(event);
  });
})

test ('should not filter when object doesnt exist', () => {
  const event = { test: { foo: { bar: [{ buzz: "Nope" }]}}};
  const awsRequestId = 'test-id'

  invokeFailureHandler(event, awsRequestId, 0.01, ["empty"])
  errorLogWasWritten(x => {
    const json = JSON.parse(x.invocationEvent);
    expect(json).toEqual(event);
  });
})