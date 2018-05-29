const CorrelationIds = require('@perform/lambda-powertools-correlation-ids')
const HTTP = require('superagent-promise')(require('superagent'), Promise)

function getRequest ({ uri }) {
  const method = options.method || ''

  switch (method.toLowerCase()) {
    case '':
    case 'get':
      return HTTP.get(uri)
    case 'head':
      return HTTP.head(uri)
    case 'post':
      return HTTP.post(uri)
    case 'put':
      return HTTP.put(uri)
    case 'delete':
      return HTTP.del(uri)
    default:
      throw new Error(`unsupported method : ${method.toLowerCase()}`)
  }
}

function setHeaders (request, headers) {
  const headerNames = Object.keys(headers)
  headerNames.forEach(h => request = request.set(h, headers[h]))

  return request
}

function setQueryStrings (request, qs) {
  if (!qs) {
    return request
  }
  
  return request.query(qs)
}

function setBody (request, body) {
  if (!body) {
    return request
  }

  return request.send(body)
}

// options: { 
//    uri     : string
//    method  : GET (default) | POST | PUT | HEAD
//    headers : object
//    qs      : object
//    body    : object
//  }
const Req = (options) => {
  if (!options) {
    throw new Error('no HTTP request options is provided')
  }

  if (!options.uri) {
    throw new Error('no HTTP uri is specified')
  }

  const correlationIds = CorrelationIds.get()

  // copy the provided headers last so it overrides the values from the context
  let headers = Object.assign({}, correlationIds, options.headers)

  let request = getRequest(options)

  request = setHeaders(request, headers)
  request = setQueryStrings(request, options.qs)
  request = setBody(request, options.body)

  return request
    .catch(e => {
      if (e.response && e.response.error) {
        throw e.response.error
      }
      
      throw e
    })
}

module.exports = Req