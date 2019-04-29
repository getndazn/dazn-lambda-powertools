# Contributing Guidelines

Welcome, and thanks in advance for your help! Please follow these simple guidelines :+1:

# How to contribute

## When you propose a new feature or bug fix

**Note:** Please make sure to write an issue first and get enough feedback before jumping into a Pull Request!

- Please make sure there is an open issue discussing your contribution
- If there isn't, please open an issue so we can talk about it before you invest time into the implementation
- When creating an issue follow the guide that GitHub shows so we have enough information about your proposal

## When you want to work on an existing issue

**Note:** Please write a quick comment in the corresponding issue and ask if the feature is still relevant and that you want to jump into the implementation.

Check out our [help wanted](https://github.com/getndazn/dazn-lambda-powertools/labels/help%20wanted) or [good first issue](https://github.com/getndazn/dazn-lambda-powertools/labels/good%20first%20issue) labels to find issues we want to move forward on with your help.

We will do our best to respond/review/merge your PR according to priority. We hope that you stay engaged with us during this period to insure QA. Please note that the PR will be closed if there hasn't been any activity for a long time (~ 30 days) to keep us focused and keep the repo clean.

## Reviewing Pull Requests

Another really useful way to contribute to this project is to review other peoples Pull Requests. Having feedback from multiple people is really helpful and reduces the overall time to make a final decision about the Pull Request.

## Writing / improving documentation

Our documentation lives in the README file in each of the package folders. Do you see a typo or other ways to improve it? Feel free to edit it and submit a Pull Request!

## Providing support

The easiest thing you can do to help us move forward and make an impact on our progress is to simply provide support to other people having difficulties with their Serverless projects.

You can do that by replying to [issues on Github](https://github.com/getndazn/dazn-lambda-powertools/issues).

---

# Code Style

We aim for clean, consistent code style. We're using ESlint to check for codestyle issues (you can run `npm run test:lint` to lint your code).

To help reduce the effort of creating contributions with this style, an [.editorconfig file](http://editorconfig.org/) is provided that your editor may use to override any conflicting global defaults and automate a subset of the style settings.

# Testing

We aim for a (near) 100% test coverage, so make sure your tests cover as much of your code as possible.

## Test coverage

During development, you can easily check coverage by running `npm test`, then opening the `index.html` file inside the `coverage` directory.

Please follow these Testing guidelines when writing your unit tests:

- Include a top-level `describe('ClassName')` block, with the name of the class you are testing
- Inside that top-level `describe()` block, create another `describe('#methodOne()')` block for each class method you might create or modify
- For each method, include an `it('should do something')` test case for each logical edge case in your changes
- As you write tests, check the code coverage and make sure all lines of code are covered.  If not, just add more test cases until everything is covered
- For reference and inspiration, please check the `__tests__` directory in each of the packages

# Commit messages

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

`Commitizen` makes it easy for you to follow this convention, here's how you can install and use it from VSCode:

Step 1. Install [commitizen](https://github.com/commitizen/cz-cli).

```
npm install -g commitizen
```

Step 2. Install [Visual Studio Code Commitizen Support](https://marketplace.visualstudio.com/items?itemName=KnisterPeter.vscode-commitizen) plugin for VS Code.

# Our Code of Conduct

Finally, to make sure you have a pleasant experience while being in our welcoming community, please read our [code of conduct](CODE_OF_CONDUCT.md). It outlines our core values and believes and will make working together a happier experience.

Thanks again for being a contributor to the community :tada:!

Cheers,
