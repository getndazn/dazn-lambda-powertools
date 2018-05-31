const Promise = require('bluebird')
const ActiveService = require('../index')

describe('Given an active service that should refresh every 100ms', () => {
  let callCount = 0

  // current time as a value that is refreshed at most ever 100ms 
  const now = ActiveService.create(
    async () => {
      callCount++
      return new Date().getTime()
    },
    100
  )

  it(`Should return the same value until refreshed`, async () => {
    const fstValue = await now.value
    const sndValue = await now.value

    expect(sndValue).toBe(fstValue)
    expect(callCount).toBe(1)

    await Promise.delay(100)

    const trdValue = await now.value
    expect(trdValue).not.toBe(sndValue)
    expect(callCount).toBe(2)
  })
})

describe(`Given an active service that fails on the first request`, () => {
  const failAlways = ActiveService.create(
    async () => { 
      throw new Error('boo') 
    },
    100
  )

  it(`Should except when yielding value`, async () => {
    expect(failAlways.value).rejects.toEqual(new Error('boo'))
  })
})

describe(`Given an active service that has cached an initial value`, () => {
  const f = jest.fn()
  const failsSnd = ActiveService.create(f, 10)

  it(`Should swallow exceptions when trying to update`, async () => {
    f.mockReturnValueOnce(Promise.resolve(42))

    const fstValue = await failsSnd.value
    expect(fstValue).toBe(42)

    await Promise.delay(10)

    f.mockRejectedValueOnce(new Error())

    // should not except, instead, return the cached value
    const sndValue = await failsSnd.value
    expect(sndValue).toBe(fstValue)

    await Promise.delay(10)

    f.mockReturnValueOnce(Promise.resolve(128))
    const trdValue = await failsSnd.value
    expect(trdValue).toBe(128)
  })
})