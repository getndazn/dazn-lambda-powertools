# dazn-lambda-power-tools

Powertools (logger, HTTP client, AWS clients, middlewares, patterns) for Lambda functions.

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