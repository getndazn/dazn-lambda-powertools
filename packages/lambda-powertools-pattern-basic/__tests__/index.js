describe('Pattern Basic', () => {
  beforeAll(() => {
    jest.mock('@perform/lambda-powertools-middleware-sample-logging', () => () => ({ after: () => {} }))
    jest.mock('@perform/lambda-powertools-middleware-correlation-ids', () => () => ({ after: () => {} }))
  })

  it('does something', async () => {
    const myFunction = jest.fn(() => 'return')
    const wrap = require('../index')

    const handler = wrap(myFunction)

    const outcome = await handler('something')

    expect(myFunction).toHaveBeenCalledWith('something')
    expect(outcome).toEqual('return')
  })
})
