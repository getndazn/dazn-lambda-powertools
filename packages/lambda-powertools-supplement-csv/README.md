# lambda-powertools-supplement-csv

A function helper to update key-value comma-separated string values.

## Getting Started

Install from NPM: `npm install @dazn/lambda-powertools-supplement-csv`

## API

Example usage:
It's exactly the same as the Step Functions (SFN) client from the AWS SDK.

```js
const supplementCsv = require('./index.js');

const SOME_KEYVALUE_CSV = 'foo:bar,baz:xyz';

const defaultValues = {
  'abc': '123',
  'baz': 'default',
};

console.log(supplementCsv({'existing': SOME_KEYVALUE_CSV, 'additional': defaultValues}));
// Output: "abc:123,baz:xyz,foo:bar"
```
