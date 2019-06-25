# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.6.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.6.0...v1.6.1) (2019-06-25)


### Bug Fixes

* fixed overly aggressive null/undefined check ([f0e2047](https://github.com/getndazn/dazn-lambda-powertools/commit/f0e2047)), closes [#64](https://github.com/getndazn/dazn-lambda-powertools/issues/64)





# [1.6.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.5.2...v1.6.0) (2019-06-24)


### Features

* **http_client:** add support for timeout ([b1c1019](https://github.com/getndazn/dazn-lambda-powertools/commit/b1c1019)), closes [#56](https://github.com/getndazn/dazn-lambda-powertools/issues/56)





## [1.5.2](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.5.1...v1.5.2) (2019-06-21)


### Bug Fixes

* don't set null/undefined HTTP headers ([14c62ff](https://github.com/getndazn/dazn-lambda-powertools/commit/14c62ff)), closes [#52](https://github.com/getndazn/dazn-lambda-powertools/issues/52)





## [1.5.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.5.0...v1.5.1) (2019-06-20)


### Bug Fixes

* stringify call-chain-length for SNS and SQS param ([ef810d6](https://github.com/getndazn/dazn-lambda-powertools/commit/ef810d6)), closes [#48](https://github.com/getndazn/dazn-lambda-powertools/issues/48)





# [1.5.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.4.2...v1.5.0) (2019-06-20)


### Features

* support override for sample debug log rate ([cae31bf](https://github.com/getndazn/dazn-lambda-powertools/commit/cae31bf)), closes [#45](https://github.com/getndazn/dazn-lambda-powertools/issues/45)





## [1.4.2](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.4.1...v1.4.2) (2019-06-20)


### Bug Fixes

* handle missing getRemainingTimeInMillis gracefully ([0aa9e35](https://github.com/getndazn/dazn-lambda-powertools/commit/0aa9e35)), closes [#44](https://github.com/getndazn/dazn-lambda-powertools/issues/44)





## [1.4.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.4.0...v1.4.1) (2019-06-14)

**Note:** Version bump only for package dazn-lambda-powertools





# [1.4.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.3.0...v1.4.0) (2019-06-14)


### Bug Fixes

* direct invokes also init call-chain-length ([fd77446](https://github.com/getndazn/dazn-lambda-powertools/commit/fd77446))


### Features

* track call-chain length and stop infinite loops ([1658212](https://github.com/getndazn/dazn-lambda-powertools/commit/1658212))





# [1.3.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.2.0...v1.3.0) (2019-06-10)


### Bug Fixes

* fixed bad commit by github ([a29f4fb](https://github.com/getndazn/dazn-lambda-powertools/commit/a29f4fb))


### Features

* add log-timeout middleware ([02c7710](https://github.com/getndazn/dazn-lambda-powertools/commit/02c7710))
* added log-timeout to basic and obfuscate patterns ([dd47b86](https://github.com/getndazn/dazn-lambda-powertools/commit/dd47b86))





# [1.2.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.1.7...v1.2.0) (2019-05-24)


### Bug Fixes

* **drone:** npm ci doesn't auto run install script ([7c4691d](https://github.com/getndazn/dazn-lambda-powertools/commit/7c4691d))
* **drone:** use node 10 and npm ci for locked packages ([758d63e](https://github.com/getndazn/dazn-lambda-powertools/commit/758d63e))
* **middleware-correlation-ids:** removed modification of message atts ([c09641c](https://github.com/getndazn/dazn-lambda-powertools/commit/c09641c))


### Features

* **middleware-correlation-ids:** support sns sqs without raw deliveries ([53bb70a](https://github.com/getndazn/dazn-lambda-powertools/commit/53bb70a))





## [1.1.7](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.1.6...v1.1.7) (2019-05-22)

**Note:** Version bump only for package dazn-lambda-power-tools





## [1.1.6](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.1.5...v1.1.6) (2019-05-17)

**Note:** Version bump only for package dazn-lambda-powertools





## [1.1.5](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.1.4...v1.1.5) (2019-04-29)

**Note:** Version bump only for package dazn-lambda-powertools





## [1.1.4](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.1.2...v1.1.4) (2019-04-23)


### Bug Fixes

* **middleware-correlation-ids:** ignore kinesis payload if not json ([8347774](https://github.com/getndazn/dazn-lambda-powertools/commit/8347774))





## [1.1.3](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.1.2...v1.1.3) (2019-04-23)


### Bug Fixes

* **middleware-correlation-ids:** ignore kinesis payload if not json ([8347774](https://github.com/getndazn/dazn-lambda-powertools/commit/8347774))





## [1.1.2](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.1.1...v1.1.2) (2019-03-28)


### Bug Fixes

* **pattern-obfuscate:** Fix typo in module exports&named parameters. ([eb08a43](https://github.com/getndazn/dazn-lambda-powertools/commit/eb08a43))





## [1.1.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.1.0...v1.1.1) (2019-03-26)

**Note:** Version bump only for package dazn-lambda-powertools





# [1.1.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.0.1...v1.1.0) (2019-03-26)


### Features

* **middleware-obfuscater:** add obfuscation by whitelisting capability. ([a90ed7f](https://github.com/getndazn/dazn-lambda-powertools/commit/a90ed7f))
* **pattern-obfuscate:** add support for obfuscation by whitelisting. ([f0036c2](https://github.com/getndazn/dazn-lambda-powertools/commit/f0036c2))





## [1.0.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.0.0...v1.0.1) (2019-03-04)

**Note:** Version bump only for package dazn-lambda-powertools





# [1.0.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v0.10.7...v1.0.0) (2019-02-26)


### Features

* add withCorrelationIds methods to clients ([4e28832](https://github.com/getndazn/dazn-lambda-powertools/commit/4e28832))
* **correlation-ids:** store global in case of version mismatch ([bab7c72](https://github.com/getndazn/dazn-lambda-powertools/commit/bab7c72))
* **correlation-ids:** use a class to allow children ([df8d4a6](https://github.com/getndazn/dazn-lambda-powertools/commit/df8d4a6))
* **correlation-ids:** use child instances for SQS + Kinesis ([dd6fd77](https://github.com/getndazn/dazn-lambda-powertools/commit/dd6fd77))
* **logger:** use a class to allow children ([f15d432](https://github.com/getndazn/dazn-lambda-powertools/commit/f15d432))
* **middleware-correlation-ids:** correlationIds + logger non-enumerable ([2432885](https://github.com/getndazn/dazn-lambda-powertools/commit/2432885))


### BREAKING CHANGES

* **correlation-ids:** Kinesis + SQS clients no longer have scope related methods.





## [0.10.7](https://github.com/getndazn/dazn-lambda-powertools/compare/v0.10.6...v0.10.7) (2019-02-25)

**Note:** Version bump only for package dazn-lambda-powertools





## [0.10.6](https://github.com/getndazn/dazn-lambda-powertools/compare/v0.10.5...v0.10.6) (2019-02-19)


### Bug Fixes

* new tests, fix undefined properties would get added to object ([dac4465](https://github.com/getndazn/dazn-lambda-powertools/commit/dac4465))





## [0.10.5](https://github.com/getndazn/dazn-lambda-powertools/compare/v0.10.4...v0.10.5) (2019-02-19)

**Note:** Version bump only for package dazn-lambda-powertools





## [0.10.4](https://github.com/getndazn/dazn-lambda-powertools/compare/v0.10.3...v0.10.4) (2019-02-18)

**Note:** Version bump only for package dazn-lambda-powertools





## [0.10.3](https://github.com/getndazn/dazn-lambda-powertools/compare/v0.10.2...v0.10.3) (2019-02-18)

**Note:** Version bump only for package dazn-lambda-powertools





## [0.10.2](https://github.com/getndazn/dazn-lambda-powertools/compare/v0.10.1...v0.10.2) (2019-02-18)


### Bug Fixes

* **build:** folled back --force-publish ([d8d2372](https://github.com/getndazn/dazn-lambda-powertools/commit/d8d2372))
* **build:** force publish all pkgs so they're all on same ver ([885a489](https://github.com/getndazn/dazn-lambda-powertools/commit/885a489))
* test ([6324176](https://github.com/getndazn/dazn-lambda-powertools/commit/6324176))





## [0.10.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v0.10.0...v0.10.1) (2019-02-18)

**Note:** Version bump only for package dazn-lambda-power-tools
