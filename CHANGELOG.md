# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 1.29.4 (2022-02-17)

**Note:** Version bump only for package @buyerassist/dazn-lambda-powertools





## [1.29.3](https://github.com/buyerassist-io/dazn-lambda-powertools/compare/v1.29.2...v1.29.3) (2022-01-01)

**Note:** Version bump only for package @buyerassist/dazn-lambda-powertools





## [1.29.2](https://github.com/buyerassist-io/dazn-lambda-powertools/compare/v1.29.1...v1.29.2) (2022-01-01)

**Note:** Version bump only for package @buyerassist/dazn-lambda-powertools





## [1.29.1](https://github.com/buyerassist-io/dazn-lambda-powertools/compare/v1.29.0...v1.29.1) (2021-12-30)

**Note:** Version bump only for package @buyerassist/dazn-lambda-powertools





# [1.29.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.28.1...v1.29.0) (2021-05-04)

### Bug Fixes

- fixed type def for correlation ids middleware ([6470a0e](https://github.com/getndazn/dazn-lambda-powertools/commit/6470a0e820402fd6937ab0767aef4095558ca0b3))

### Documentation

- dummy update to mark PR as breaking ([ebc419a](https://github.com/getndazn/dazn-lambda-powertools/commit/ebc419afc6acc80b650d5bce811fd2189bfb783c))

### Features

- upgrade to middy v2.x ([ad0410f](https://github.com/getndazn/dazn-lambda-powertools/commit/ad0410f2b78a38afd927067c9e17e65ebfda669d))
- upgrade types to reflect middy v2.x usage ([cc3002b](https://github.com/getndazn/dazn-lambda-powertools/commit/cc3002b9b9177e07d918260ee1b600d403dbc29c))

### BREAKING CHANGES

- Middy middleware contract have changed, so anyone using the pattern packages with their own middlewares have to use compatible versions of middy middlewares

## [1.28.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.28.0...v1.28.1) (2020-12-10)

**Note:** Version bump only for package @buyerassist/dazn-lambda-powertools

# [1.28.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.27.0...v1.28.0) (2020-12-10)

### Features

- added support for setting debug logging ([1887e9b](https://github.com/getndazn/dazn-lambda-powertools/commit/1887e9b7ec4b9bb6dc1b5649c4d4b815b4350dad)), closes [#237](https://github.com/getndazn/dazn-lambda-powertools/issues/237)

# [1.27.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.26.0...v1.27.0) (2020-08-12)

### Bug Fixes

- **middleware-correlationid:** log by default ([bd148c8](https://github.com/getndazn/dazn-lambda-powertools/commit/bd148c89821af2d3b41c78e4e92f0aa12356c1be))

### Features

- added typing for patterns and exposed logger ([a4ceca1](https://github.com/getndazn/dazn-lambda-powertools/commit/a4ceca1fb0450309f878db7583091b95b5c19ce8))
- removed exposed logger ([5a5628c](https://github.com/getndazn/dazn-lambda-powertools/commit/5a5628cf76e7ae0e2d0a606ef00248eca816deb9))

# [1.26.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.25.0...v1.26.0) (2020-08-11)

### Features

- typings for clients ([053c288](https://github.com/getndazn/dazn-lambda-powertools/commit/053c288a69337ad4d537dd115af79b092791e440))

# [1.25.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.24.3...v1.25.0) (2020-07-30)

### Features

- **middleware-correlation-ids:** fixing error thrown by isMatch ([6f35266](https://github.com/getndazn/dazn-lambda-powertools/commit/6f352662aec3f9f2a0d718a91fc015b861efbc0d))

## [1.24.3](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.24.2...v1.24.3) (2020-07-24)

**Note:** Version bump only for package @buyerassist/dazn-lambda-powertools

## [1.24.2](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.24.1...v1.24.2) (2020-07-23)

**Note:** Version bump only for package @buyerassist/dazn-lambda-powertools

## [1.24.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.24.0...v1.24.1) (2020-06-03)

**Note:** Version bump only for package @buyerassist/dazn-lambda-powertools

# [1.24.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.23.2...v1.24.0) (2020-05-29)

### Features

- move to middy 1.0 ([db95598](https://github.com/getndazn/dazn-lambda-powertools/commit/db95598075bb908438bd97ee5394f9ca9fe8c050))
- **correlation + logger:** added typings ([#212](https://github.com/getndazn/dazn-lambda-powertools/issues/212)) ([75e2f33](https://github.com/getndazn/dazn-lambda-powertools/commit/75e2f332f01744ef351a24506e6026cabf29e33b))

## [1.23.2](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.23.1...v1.23.2) (2020-05-22)

**Note:** Version bump only for package @buyerassist/dazn-lambda-powertools

## [1.23.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.23.0...v1.23.1) (2020-04-19)

### Reverts

- Revert "build(deps-dev): [security] bump lodash from 4.17.11 to 4.17.13" ([713ae4e](https://github.com/getndazn/dazn-lambda-powertools/commit/713ae4e03a53273b68f183534340f39fd3163d28))

# [1.23.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.22.1...v1.23.0) (2020-04-06)

### Features

- **logger:** use the correct console logging methods ([036c00d](https://github.com/getndazn/dazn-lambda-powertools/commit/036c00d2ddb62374cd7546d55de78aca9319cfab))

## [1.22.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.22.0...v1.22.1) (2020-04-01)

**Note:** Version bump only for package @buyerassist/dazn-lambda-powertools

# [1.22.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.21.1...v1.22.0) (2020-03-31)

### Bug Fixes

- **middleware:** remove unnecessary alb correlation id ([4b91e5a](https://github.com/getndazn/dazn-lambda-powertools/commit/4b91e5a))
- update package-locks ([756131d](https://github.com/getndazn/dazn-lambda-powertools/commit/756131d))

### Features

- **middleware:** add alb as an event source ([4bbd429](https://github.com/getndazn/dazn-lambda-powertools/commit/4bbd429))
- set alb user-agent correlationId as User-Agent ([b794dbf](https://github.com/getndazn/dazn-lambda-powertools/commit/b794dbf))

## [1.21.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.21.0...v1.21.1) (2020-03-31)

### Bug Fixes

- **deps:** aws-sdk should not be a direct dependency ([27c04b2](https://github.com/getndazn/dazn-lambda-powertools/commit/27c04b2))

# [1.21.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.20.0...v1.21.0) (2020-02-09)

### Features

- **logger:** added support for BigInt ([e745d02](https://github.com/getndazn/dazn-lambda-powertools/commit/e745d02))
- made aws-sdk dev dep in correlation ids pkg ([989ae86](https://github.com/getndazn/dazn-lambda-powertools/commit/989ae86)), closes [#149](https://github.com/getndazn/dazn-lambda-powertools/issues/149)

# [1.20.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.19.0...v1.20.0) (2020-02-08)

### Features

- **serverless-offline:** Added support for offline development ([f73b7e5](https://github.com/getndazn/dazn-lambda-powertools/commit/f73b7e5))

# [1.19.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.18.1...v1.19.0) (2020-01-30)

### Features

- **sample logging middleware:** optional error catch ([89ce3ed](https://github.com/getndazn/dazn-lambda-powertools/commit/89ce3ed))

## [1.18.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.18.0...v1.18.1) (2020-01-07)

**Note:** Version bump only for package @buyerassist/dazn-lambda-powertools

# [1.18.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.17.0...v1.18.0) (2020-01-05)

### Features

- added CloudWatchEvents client ([d573ce5](https://github.com/getndazn/dazn-lambda-powertools/commit/d573ce5)), closes [#135](https://github.com/getndazn/dazn-lambda-powertools/issues/135)
- added eventbridge client package ([7d27134](https://github.com/getndazn/dazn-lambda-powertools/commit/7d27134)), closes [#135](https://github.com/getndazn/dazn-lambda-powertools/issues/135)
- added the new clients to the Lambda layer ([7229d04](https://github.com/getndazn/dazn-lambda-powertools/commit/7229d04))
- support eventbridge in correlation ids middleware ([936f3ee](https://github.com/getndazn/dazn-lambda-powertools/commit/936f3ee)), closes [#135](https://github.com/getndazn/dazn-lambda-powertools/issues/135)

# [1.17.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.16.1...v1.17.0) (2020-01-02)

### Features

- **http-client:** add support for patch and url option ([6e70261](https://github.com/getndazn/dazn-lambda-powertools/commit/6e70261))

## [1.16.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.16.0...v1.16.1) (2020-01-02)

### Bug Fixes

- **http-client:** honor custom metricName option when passed in ([48a275a](https://github.com/getndazn/dazn-lambda-powertools/commit/48a275a))

# [1.16.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.15.6...v1.16.0) (2020-01-01)

### Features

- handle cases when context is undefined ([176810d](https://github.com/getndazn/dazn-lambda-powertools/commit/176810d)), closes [#133](https://github.com/getndazn/dazn-lambda-powertools/issues/133)

## [1.15.6](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.15.5...v1.15.6) (2019-11-15)

**Note:** Version bump only for package @buyerassist/dazn-lambda-powertools

## [1.15.5](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.15.4...v1.15.5) (2019-11-15)

**Note:** Version bump only for package @buyerassist/dazn-lambda-powertools

## [1.15.4](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.15.3...v1.15.4) (2019-11-15)

**Note:** Version bump only for package @buyerassist/dazn-lambda-powertools

## [1.15.3](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.15.2...v1.15.3) (2019-11-15)

**Note:** Version bump only for package @buyerassist/dazn-lambda-powertools

## [1.15.2](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.15.1...v1.15.2) (2019-11-14)

**Note:** Version bump only for package @buyerassist/dazn-lambda-powertools

## [1.15.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.15.0...v1.15.1) (2019-11-14)

**Note:** Version bump only for package @buyerassist/dazn-lambda-powertools

# [1.15.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.14.0...v1.15.0) (2019-11-14)

### Features

- override DATADOG_PREFIX only if undefined ([f7b2bae](https://github.com/getndazn/dazn-lambda-powertools/commit/f7b2bae))

# [1.14.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.13.0...v1.14.0) (2019-10-09)

### Bug Fixes

- add missing shebang to layer script ([7e2f01e](https://github.com/getndazn/dazn-lambda-powertools/commit/7e2f01e))

### Features

- **middleware-corr-ids:** support for dynamodb streams ([9cd167c](https://github.com/getndazn/dazn-lambda-powertools/commit/9cd167c))
- add dynamodb client to layer ([3f6897b](https://github.com/getndazn/dazn-lambda-powertools/commit/3f6897b))
- added dynamodb-client project ([f0e6de2](https://github.com/getndazn/dazn-lambda-powertools/commit/f0e6de2))

# [1.13.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.12.1...v1.13.0) (2019-10-09)

### Features

- added build script for layer ([f8d4111](https://github.com/getndazn/dazn-lambda-powertools/commit/f8d4111))
- deploy all the powertools as a single layer ([109c84c](https://github.com/getndazn/dazn-lambda-powertools/commit/109c84c)), closes [#90](https://github.com/getndazn/dazn-lambda-powertools/issues/90)

## [1.12.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.12.0...v1.12.1) (2019-10-07)

### Bug Fixes

- **pattern-obfuscate:** keep original DATADOG_TAGS values ([c2a11b6](https://github.com/getndazn/dazn-lambda-powertools/commit/c2a11b6))

# [1.12.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.11.0...v1.12.0) (2019-10-02)

### Bug Fixes

- removed HTTP keep-alive code ([7127044](https://github.com/getndazn/dazn-lambda-powertools/commit/7127044)), closes [#89](https://github.com/getndazn/dazn-lambda-powertools/issues/89)

### Features

- enable HTTP keepalive via env var instead ([bcf22f2](https://github.com/getndazn/dazn-lambda-powertools/commit/bcf22f2))

# [1.11.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.10.0...v1.11.0) (2019-09-05)

### Features

- use API GW request ID as correlation ID ([00e5153](https://github.com/getndazn/dazn-lambda-powertools/commit/00e5153)), closes [#92](https://github.com/getndazn/dazn-lambda-powertools/issues/92)

# [1.10.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.9.1...v1.10.0) (2019-08-29)

### Bug Fixes

- **firehose:** fixed mixmatched event structure (missing Record) ([f4b742e](https://github.com/getndazn/dazn-lambda-powertools/commit/f4b742e))

### Features

- added firehose client ([535e788](https://github.com/getndazn/dazn-lambda-powertools/commit/535e788)), closes [#27](https://github.com/getndazn/dazn-lambda-powertools/issues/27)
- **firehose:** add middleware support for firehose ([4a8803c](https://github.com/getndazn/dazn-lambda-powertools/commit/4a8803c)), closes [#27](https://github.com/getndazn/dazn-lambda-powertools/issues/27)

## [1.9.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.9.0...v1.9.1) (2019-08-24)

### Bug Fixes

- **log-timeout:** check timer is set before attempting to clear ([b2f3c21](https://github.com/getndazn/dazn-lambda-powertools/commit/b2f3c21)), closes [#82](https://github.com/getndazn/dazn-lambda-powertools/issues/82)

# [1.9.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.8.3...v1.9.0) (2019-08-23)

### Features

- **logger:** make params optional when logging the error stack ([c095376](https://github.com/getndazn/dazn-lambda-powertools/commit/c095376))

## [1.8.3](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.8.2...v1.8.3) (2019-07-25)

**Note:** Version bump only for package @buyerassist/dazn-lambda-powertools

## [1.8.2](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.8.1...v1.8.2) (2019-07-24)

**Note:** Version bump only for package @buyerassist/dazn-lambda-powertools

## [1.8.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.8.0...v1.8.1) (2019-07-23)

### Bug Fixes

- circleci yaml indent ([35b1365](https://github.com/getndazn/dazn-lambda-powertools/commit/35b1365))
- **http-client:** update metrics package ([0fa03e0](https://github.com/getndazn/dazn-lambda-powertools/commit/0fa03e0))
- publishing package step update ([e28749c](https://github.com/getndazn/dazn-lambda-powertools/commit/e28749c))

# [1.8.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.7.0...v1.8.0) (2019-07-10)

### Features

- enable HTTP keep alive on AWS clients ([6a963ac](https://github.com/getndazn/dazn-lambda-powertools/commit/6a963ac)), closes [#66](https://github.com/getndazn/dazn-lambda-powertools/issues/66)
- **logger:** add static level getter ([9f18c0d](https://github.com/getndazn/dazn-lambda-powertools/commit/9f18c0d))

# [1.7.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.6.1...v1.7.0) (2019-06-25)

### Bug Fixes

- fixes datadog tags overwritten ([7312901](https://github.com/getndazn/dazn-lambda-powertools/commit/7312901))
- supplements existing datadog tags with our own ([d78bd77](https://github.com/getndazn/dazn-lambda-powertools/commit/d78bd77))

### Features

- allows values with colon and values without keys in csv ([5689eab](https://github.com/getndazn/dazn-lambda-powertools/commit/5689eab))
- reworked supplementing csv values for datadog metrics ([3ce679b](https://github.com/getndazn/dazn-lambda-powertools/commit/3ce679b))

## [1.6.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.6.0...v1.6.1) (2019-06-25)

### Bug Fixes

- fixed overly aggressive null/undefined check ([f0e2047](https://github.com/getndazn/dazn-lambda-powertools/commit/f0e2047)), closes [#64](https://github.com/getndazn/dazn-lambda-powertools/issues/64)

# [1.6.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.5.2...v1.6.0) (2019-06-24)

### Features

- **http_client:** add support for timeout ([b1c1019](https://github.com/getndazn/dazn-lambda-powertools/commit/b1c1019)), closes [#56](https://github.com/getndazn/dazn-lambda-powertools/issues/56)

## [1.5.2](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.5.1...v1.5.2) (2019-06-21)

### Bug Fixes

- don't set null/undefined HTTP headers ([14c62ff](https://github.com/getndazn/dazn-lambda-powertools/commit/14c62ff)), closes [#52](https://github.com/getndazn/dazn-lambda-powertools/issues/52)

## [1.5.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.5.0...v1.5.1) (2019-06-20)

### Bug Fixes

- stringify call-chain-length for SNS and SQS param ([ef810d6](https://github.com/getndazn/dazn-lambda-powertools/commit/ef810d6)), closes [#48](https://github.com/getndazn/dazn-lambda-powertools/issues/48)

# [1.5.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.4.2...v1.5.0) (2019-06-20)

### Features

- support override for sample debug log rate ([cae31bf](https://github.com/getndazn/dazn-lambda-powertools/commit/cae31bf)), closes [#45](https://github.com/getndazn/dazn-lambda-powertools/issues/45)

## [1.4.2](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.4.1...v1.4.2) (2019-06-20)

### Bug Fixes

- handle missing getRemainingTimeInMillis gracefully ([0aa9e35](https://github.com/getndazn/dazn-lambda-powertools/commit/0aa9e35)), closes [#44](https://github.com/getndazn/dazn-lambda-powertools/issues/44)

## [1.4.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.4.0...v1.4.1) (2019-06-14)

**Note:** Version bump only for package dazn-lambda-powertools

# [1.4.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.3.0...v1.4.0) (2019-06-14)

### Bug Fixes

- direct invokes also init call-chain-length ([fd77446](https://github.com/getndazn/dazn-lambda-powertools/commit/fd77446))

### Features

- track call-chain length and stop infinite loops ([1658212](https://github.com/getndazn/dazn-lambda-powertools/commit/1658212))

# [1.3.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.2.0...v1.3.0) (2019-06-10)

### Bug Fixes

- fixed bad commit by github ([a29f4fb](https://github.com/getndazn/dazn-lambda-powertools/commit/a29f4fb))

### Features

- add log-timeout middleware ([02c7710](https://github.com/getndazn/dazn-lambda-powertools/commit/02c7710))
- added log-timeout to basic and obfuscate patterns ([dd47b86](https://github.com/getndazn/dazn-lambda-powertools/commit/dd47b86))

# [1.2.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.1.7...v1.2.0) (2019-05-24)

### Bug Fixes

- **drone:** npm ci doesn't auto run install script ([7c4691d](https://github.com/getndazn/dazn-lambda-powertools/commit/7c4691d))
- **drone:** use node 10 and npm ci for locked packages ([758d63e](https://github.com/getndazn/dazn-lambda-powertools/commit/758d63e))
- **middleware-correlation-ids:** removed modification of message atts ([c09641c](https://github.com/getndazn/dazn-lambda-powertools/commit/c09641c))

### Features

- **middleware-correlation-ids:** support sns sqs without raw deliveries ([53bb70a](https://github.com/getndazn/dazn-lambda-powertools/commit/53bb70a))

## [1.1.7](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.1.6...v1.1.7) (2019-05-22)

**Note:** Version bump only for package dazn-lambda-power-tools

## [1.1.6](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.1.5...v1.1.6) (2019-05-17)

**Note:** Version bump only for package dazn-lambda-powertools

## [1.1.5](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.1.4...v1.1.5) (2019-04-29)

**Note:** Version bump only for package dazn-lambda-powertools

## [1.1.4](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.1.2...v1.1.4) (2019-04-23)

### Bug Fixes

- **middleware-correlation-ids:** ignore kinesis payload if not json ([8347774](https://github.com/getndazn/dazn-lambda-powertools/commit/8347774))

## [1.1.3](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.1.2...v1.1.3) (2019-04-23)

### Bug Fixes

- **middleware-correlation-ids:** ignore kinesis payload if not json ([8347774](https://github.com/getndazn/dazn-lambda-powertools/commit/8347774))

## [1.1.2](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.1.1...v1.1.2) (2019-03-28)

### Bug Fixes

- **pattern-obfuscate:** Fix typo in module exports&named parameters. ([eb08a43](https://github.com/getndazn/dazn-lambda-powertools/commit/eb08a43))

## [1.1.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.1.0...v1.1.1) (2019-03-26)

**Note:** Version bump only for package dazn-lambda-powertools

# [1.1.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.0.1...v1.1.0) (2019-03-26)

### Features

- **middleware-obfuscater:** add obfuscation by whitelisting capability. ([a90ed7f](https://github.com/getndazn/dazn-lambda-powertools/commit/a90ed7f))
- **pattern-obfuscate:** add support for obfuscation by whitelisting. ([f0036c2](https://github.com/getndazn/dazn-lambda-powertools/commit/f0036c2))

## [1.0.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v1.0.0...v1.0.1) (2019-03-04)

**Note:** Version bump only for package dazn-lambda-powertools

# [1.0.0](https://github.com/getndazn/dazn-lambda-powertools/compare/v0.10.7...v1.0.0) (2019-02-26)

### Features

- add withCorrelationIds methods to clients ([4e28832](https://github.com/getndazn/dazn-lambda-powertools/commit/4e28832))
- **correlation-ids:** store global in case of version mismatch ([bab7c72](https://github.com/getndazn/dazn-lambda-powertools/commit/bab7c72))
- **correlation-ids:** use a class to allow children ([df8d4a6](https://github.com/getndazn/dazn-lambda-powertools/commit/df8d4a6))
- **correlation-ids:** use child instances for SQS + Kinesis ([dd6fd77](https://github.com/getndazn/dazn-lambda-powertools/commit/dd6fd77))
- **logger:** use a class to allow children ([f15d432](https://github.com/getndazn/dazn-lambda-powertools/commit/f15d432))
- **middleware-correlation-ids:** correlationIds + logger non-enumerable ([2432885](https://github.com/getndazn/dazn-lambda-powertools/commit/2432885))

### BREAKING CHANGES

- **correlation-ids:** Kinesis + SQS clients no longer have scope related methods.

## [0.10.7](https://github.com/getndazn/dazn-lambda-powertools/compare/v0.10.6...v0.10.7) (2019-02-25)

**Note:** Version bump only for package dazn-lambda-powertools

## [0.10.6](https://github.com/getndazn/dazn-lambda-powertools/compare/v0.10.5...v0.10.6) (2019-02-19)

### Bug Fixes

- new tests, fix undefined properties would get added to object ([dac4465](https://github.com/getndazn/dazn-lambda-powertools/commit/dac4465))

## [0.10.5](https://github.com/getndazn/dazn-lambda-powertools/compare/v0.10.4...v0.10.5) (2019-02-19)

**Note:** Version bump only for package dazn-lambda-powertools

## [0.10.4](https://github.com/getndazn/dazn-lambda-powertools/compare/v0.10.3...v0.10.4) (2019-02-18)

**Note:** Version bump only for package dazn-lambda-powertools

## [0.10.3](https://github.com/getndazn/dazn-lambda-powertools/compare/v0.10.2...v0.10.3) (2019-02-18)

**Note:** Version bump only for package dazn-lambda-powertools

## [0.10.2](https://github.com/getndazn/dazn-lambda-powertools/compare/v0.10.1...v0.10.2) (2019-02-18)

### Bug Fixes

- **build:** folled back --force-publish ([d8d2372](https://github.com/getndazn/dazn-lambda-powertools/commit/d8d2372))
- **build:** force publish all pkgs so they're all on same ver ([885a489](https://github.com/getndazn/dazn-lambda-powertools/commit/885a489))
- test ([6324176](https://github.com/getndazn/dazn-lambda-powertools/commit/6324176))

## [0.10.1](https://github.com/getndazn/dazn-lambda-powertools/compare/v0.10.0...v0.10.1) (2019-02-18)

**Note:** Version bump only for package dazn-lambda-power-tools
