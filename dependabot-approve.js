/* eslint-disable no-console */
const { Octokit } = require('@octokit/rest')

const git = new Octokit({
  auth: process.env.GH_TOKEN
})

const getPr = async (owner, repo, commitId) => {
  const response = await git.pulls.list({
    owner,
    repo,
    sort: 'updated',
    direction: 'desc',
    state: 'open'
  })

  return response.data.find((pr) => pr.head.sha === commitId &&
    ['dependabot-preview[bot]', 'dependabot[bot]'].includes(pr.user.login))
}

(async function () {
  const {
    GH_TOKEN: githubToken,
    CIRCLE_SHA1: commitId,
    CIRCLE_PROJECT_REPONAME: repo,
    CIRCLE_PROJECT_USERNAME: owner
  } = process.env

  if (!owner || !repo || !commitId || !githubToken) {
    console.error('Missing a required env var CIRCLE_PROJECT_USERNAME, CIRCLE_PROJECT_REPONAME, CIRCLE_SHA1 or GH_TOKEN')
    return
  }

  const pr = await getPr(owner, repo, commitId)
  if (!pr) {
    console.log('This is not a Dependabot PR.')
    return
  }

  await git.pulls.createReview({
    owner,
    repo,
    pull_number: pr.number, // eslint-disable-line camelcase
    event: 'APPROVE'
  })

  console.log('PR approval sent')
}())
