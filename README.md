# dazn-lambda-power-tools

An integrated suite of powertools for Lambda functions to make it effortless for you to comply with our guidelines around logging and monitoring:

* support correlation IDs

* debug logs are turned off in production

* debug logs are sampled for 1% of invocations

* debug logging decisions are respected by all the functions on a call chain

* HTTP requests always report both latency as well as response count metrics

## Design goal

Compliance with our guidelines around logging and monitoring should be the default behaviour. These tools make it simple for you to **do the right thing** and gets out of your way as much as possible.

See the README for each of these tools to find out how to use them.

## Overview of available tools

* [logger](/packages/lambda-powertools-logger): integrates with other packages to support correlation IDs, configurable log level, and sampling (only enable debug logs on 1% of invocations)

* [correlation IDs](/packages/lambda-powertools-correlation-ids): create and store correlation IDs that follow our naming convention

* [correlation IDs middleware](/packages/lambda-powertools-middleware-correlation-ids): automatically extract correlation IDs from the invocation event

* [sample logging middleware](/packages/lambda-powertools-middleware-sample-logging): enable debug logging for 1% of invocations, or when upstream caller has made the decision to enable debug logging

* [http client](/packages/lambda-powertools-http-client): HTTP client that automatically forwards any correlation IDs you have captured or created, and records both latency as well as response count metrics

* [SNS client](/packages/lambda-powertools-sns-client): SNS client that automatically forwards any correlation IDs you have captured or created when you publish a message to SNS

* [Kinesis client](/packages/lambda-powertools-kinesis-client): Kinesis client that automatically forwards any correlation IDs you have captured or created when you publish record(s) to a Kinesis stream

* [Step Functions client](/packages/lambda-powertools-step-functions-client): Step Functions client that automatically forwards any correlation IDs you have captured or created when you start an execution

* [Lambda client](/packages/lambda-powertools-sns-client): Lambda client that automatically forwards any correlation IDs you have captured or created when you invokes a Lambda function directly

* [basic template for a function](/packages/lambda-powertools-pattern-basic): wrapper for your function that applies and configures the function to work well with datadog metrics and sample logging

## Useful Lerna CLI commands

### bootstrapping locally

Because of the inter-dependencies between packages, it can be tricky to test your changes haven't broken another package.

You can use [Lerna](https://lernajs.io/) CLI to bootstrap all the dependencies with the current local version:

```
lerna bootstrap
```

### run all tests

```
lerna run test
```

### publishing all packages

```
lerna publish --skip-git --skip-npm --force-publish * --yes && lerna exec -- npm publish
```

This command lets you choose the new version to increment to and makes it easy for you to follow semantic versioning.

Once published, don't forget to tag, commit and push to github.