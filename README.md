# dazn-lambda-power-tools

An integrated suite of powertools for Lambda functions to make it effortless for you to comply with our guidelines around logging and monitoring:

* support correlation IDs

* debug logs are turned off in production, and are instead sampled for 1% of invocations

* debug logging decisions are respected by all the functions on a call chain

* HTTP requests always report both latency as well as response count metrics

## Overview of available tools

* [logger](/packages/lambda-powertools-logger): structured logging with JSON, configurable log levels, and integrates with other tools to support correlation IDs and sampling (only enable debug logs on 1% of invocations)

* [correlation IDs](/packages/lambda-powertools-correlation-ids): create and store correlation IDs that follow our naming convention

* [correlation IDs middleware](/packages/lambda-powertools-middleware-correlation-ids): automatically extract correlation IDs from the invocation event

* [sample logging middleware](/packages/lambda-powertools-middleware-sample-logging): enable debug logging for 1% of invocations, or when upstream caller has made the decision to enable debug logging

* [http client](/packages/lambda-powertools-http-client): HTTP client that automatically forwards any correlation IDs you have captured or created, and records both latency as well as response count metrics

* [SNS client](/packages/lambda-powertools-sns-client): SNS client that automatically forwards any correlation IDs you have captured or created when you publish a message to SNS

* [SQS client](/packages/lambda-powertools-sqs-client): SQS client that automatically forwards any correlation IDs you have captured or created when you publish a message to SQS

* [Kinesis client](/packages/lambda-powertools-kinesis-client): Kinesis client that automatically forwards any correlation IDs you have captured or created when you publish record(s) to a Kinesis stream

* [Step Functions client](/packages/lambda-powertools-step-functions-client): Step Functions client that automatically forwards any correlation IDs you have captured or created when you start an execution

* [Lambda client](/packages/lambda-powertools-lambda-client): Lambda client that automatically forwards any correlation IDs you have captured or created when you invokes a Lambda function directly

* [basic template for a function](/packages/lambda-powertools-pattern-basic): wrapper for your function that applies and configures the function to work well with datadog metrics and sample logging

## Design goal

Compliance with our guidelines around logging and monitoring should be the default behaviour. These tools make it simple for you to **do the right thing** and **gets out of your way** as much as possible.

Individually they are useful on their own right, but together they're so much more useful!

The middlewares capture incoming correlation IDs, and the logger automatically includes them in every log message, and the other clients (HTTP, Kinesis, SNS, etc.) would also automatically forward them on to external systems.

Even if your function doens't do anything with correlation IDs, the tools make sure that it behalves correctly as these correlation IDs flows through it.

![](powertools-illustrated.png)

### Did you consider monkey-patching the clients instead?

Instead of forcing you to use our own AWS clients, we could have monkey patched the AWS SDK clients (which we already do in the tests). We can also monkey patch Node's `http` module (like what [Nock](https://github.com/node-nock/nock) does) to intercept HTTP requests and inject correlation IDs as HTTP headers.

We can apply these monkey patching when you apply the correlation IDs middleware, and your function would automagically forward correlation IDs without having to use our own client libraries. That way, as a user of the tools, I can use whatever HTTP client I wish, and can use the standard SDK clients as well.

We did entertain this idea, but I wanted to leave at least one decision for you to make. The rationale is that when things go wrong (e.g. unhandled error, or bug in our wrapper code) or when they don't work as expected (e.g. you're using an AWS SDK client that we don't support yet), at least you have that one decision (in the form of a `require` statement) to start debugging.

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

### create a new package

```
lerna create <name of package>
```

and follow the instruction to bootstrap the new project.

## Contribution Guide

Step 1. Install [commitizen](https://github.com/commitizen/cz-cli).

```
npm install -g commitizen
```

Step 2. Install [Visual Studio Code Commitizen Support](https://marketplace.visualstudio.com/items?itemName=KnisterPeter.vscode-commitizen) plugin for VS Code.

### Commit messages

This project uses `Lerna version` and `Lerna publish` to publish NPM updates and generate [CHANGELOG](CHANGELOG.md). For these to work, it depends on [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.3).

As such, when you create a PR, you should make sure your commits follow the convention of: `<type>[package name]: <description>`.

For example:

* A bug fix to `lambda-powertools-logger` should read:

```text
fix(logger): some description.
```

* A new feature to `lambda-powertools-middleware-correlation-ids` should read:

```text
feat(middleware-correlation-ids): some description.
```

* A new breaking change to `lambda-powertools-sns-client` should read:

```text
feat(sns-client): some description.

BREAKING CHANGE: `publish` no longer does x.
```

* A `README.md` (this file) change should read:

```text
docs: added Contribution Guide.
```

* A change to the build pipeline (e.g. `drone.yml`) should read:

```text
build: some description.
```

* Other misc chores should read:

```text
chore: some description.
```
