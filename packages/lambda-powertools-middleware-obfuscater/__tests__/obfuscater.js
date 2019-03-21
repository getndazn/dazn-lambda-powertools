const { obfuscate, FILTERING_MODE } = require('../obfuscater')
const OBFUSCATION_MASK = Object.freeze("******")

const invokeObfuscater = (event, obfuscationFilters, filteringMode) => {
  return obfuscate(event, obfuscationFilters, filteringMode)
}

describe('Obfuscater middleware', () => {

  it.each`
  filters          | filteringMode                        
  ${ ['foo.bar'] } | ${ null }                    
  ${ ['foo.bar'] } | ${ '' }
  ${ ['foo.bar'] } | ${ undefined }
  ${ null }        | ${ FILTERING_MODE.BLACKLIST }             
  ${ '' }          | ${ FILTERING_MODE.BLACKLIST } 
  ${ undefined }   | ${ FILTERING_MODE.BLACKLIST }
  ${ 'notnarray' } | ${ FILTERING_MODE.BLACKLIST }                   
`('does not process events when invalid input parameters are provided', ({ filters, filteringMode }) => {
    const event = { foo: "bar" };
    const expected = event
    const actual = invokeObfuscater(event, filters, filteringMode)
    expect(actual).toEqual(expected)
  })


  describe("filtering_mode = BLACKLIST", () => {
    it.each`
    event                                     | filters                  | expected                        
    ${ {f1: {f2: 'wat' }} }                   | ${ ["f1.f2"]}            | ${ { f1: {f2: OBFUSCATION_MASK }} }
    ${ {f1: {f2: 'wat' }} }                   | ${ ["f1"]}               | ${ { f1: {f2: OBFUSCATION_MASK }} }
    ${ {f1: {f2: 'wat' }} }                   | ${ ["anotherfield"]}     | ${ {f1: {f2: 'wat' }} } 
    ${ {f1: {f2: [{f3: {f4: 'val' }}]}}}      | ${ ["f1.f2"]}            | ${ {f1: {f2: [{f3: {f4: OBFUSCATION_MASK }}]}} }
    ${ {f1: 'wat', f1AndAnotherWord: "wat"} } | ${ ["f1"]}               | ${ {f1: OBFUSCATION_MASK, f1AndAnotherWord: "wat"} } 
    ${ {f1: [{f2: 'wat' }, {f3: 'wat' }]} }   | ${ ["f1.*.f2"]}          | ${ { f1: [{f2: OBFUSCATION_MASK },{f3: 'wat' }]} }
    ${ {f1: [{f2: 'wat' }, {f2: 'wat' }]} }   | ${ ["f1.1.f2"]}          | ${ {f1: [{f2: 'wat' }, {f2: OBFUSCATION_MASK }]} }
    ${ {f1: [{f2: [{f3: 'wat' }]}]} }         | ${ ["f1.*.f2.*.f3"]}     | ${ {f1: [{f2: [{f3: OBFUSCATION_MASK }]}]} }    
  `('filters as expected for base cases', ({ event, filters, expected }) => {
      const actual = invokeObfuscater(event, filters, FILTERING_MODE.BLACKLIST)
      expect(actual).toEqual(expected)
    })

    it('obfuscates as expected for representative examples', () => {
      const event = require('./fixture/blacklist/fixture.json')
      const expectedOutcome = require('./fixture/blacklist/expected.json')
     
      const converted = invokeObfuscater(event, [
        'Records.*.dynamodb.NewImage.firstName',
        'Records.*.dynamodb.NewImage.lastName',
        'Records.*.dynamodb.NewImage.email',
        'Records.*.dynamodb.NewImage.ipAddress',
        'Records.*.dynamodb.OldImage.firstName',
        'Records.*.dynamodb.OldImage.lastName',
        'Records.*.dynamodb.OldImage.email',
        'Records.*.dynamodb.OldImage.ipAddress'
      ], FILTERING_MODE.BLACKLIST)

      expect(converted).toEqual(expectedOutcome)
    })

  })


  describe("filtering_mode = WHITELIST", () => {
    
    it.each`
    event                                           | filters                  | expected                        
    ${ {f1: {f2: 'wat' }} }                         | ${ ["f1.f2"]}            | ${ {f1: {f2: 'wat' }} } }
    ${ {f1: {f2: 'wat' },f3: {f4: "val"}} }         | ${ ["f1.f2"]}            | ${ {f1: {f2: 'wat' },f3: {f4: OBFUSCATION_MASK}} } 
    ${ {f1: {f2: 'wat' }} }                         | ${ ["anotherfield"]}     | ${ {f1: {f2: OBFUSCATION_MASK }} }  
    ${ {f1: [{f2: 'wat' }, {f3: 'wat' }]} }         | ${ ["f1.*.f3"]}          | ${ {f1: [{f2: OBFUSCATION_MASK }, {f3: 'wat' }]} } 
    ${ {f1: [{f2: [{f3: 'wat' }]}, {f3: 'wat'}]} }  | ${ ["f1.*.f2.*.f3"]}     | ${ {f1: [{f2: [{f3: 'wat' }]}, {f3: OBFUSCATION_MASK}]} }    
  `('filters as expected for base cases', ({ event, filters, expected }) => {
      const actual = invokeObfuscater(event, filters, FILTERING_MODE.WHITELIST)
      expect(actual).toEqual(expected)
    })

    it('obfuscates as expected for representative examples', () => {
      const event = require('./fixture/whitelist/fixture.json')
      const expectedOutcome = require('./fixture/whitelist/expected.json')
     
      const converted = invokeObfuscater(event, [
        'Records.*.eventID',
        'Records.*.eventName',
        'Records.*.eventVersion',
        'Records.*.eventSource',
        'Records.*.awsRegion',
        'Records.*.dynamodb.Keys',
        'Records.*.dynamodb.ApproximateCreationDateTime',
        'Records.*.dynamodb.NewImage.eventType',
        'Records.*.dynamodb.NewImage.id',
        'Records.*.dynamodb.NewImage.aws:rep:updatetime',
        'Records.*.dynamodb.NewImage.aws:rep:deleting',
        'Records.*.dynamodb.NewImage.aws:rep:updateregion',
        'Records.*.dynamodb.OldImage.eventType',
        'Records.*.dynamodb.OldImage.id',
        'Records.*.dynamodb.SequenceNumber',
        'Records.*.dynamodb.SizeBytes',
        'Records.*.dynamodb.StreamViewType',
        'Records.*.eventSourceARN',
      ], FILTERING_MODE.WHITELIST)
  
      expect(converted).toEqual(expectedOutcome)
    })

  })
})