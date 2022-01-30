const core = require('@actions/core');
const { context, getOctokit } = require('@actions/github');
const run = require('./run');

process.on('unhandledRejection', handleError);
main().catch(handleError);

async function main() {
  const token = core.getInput('github-token', { required: true });
  const directory = core.getInput('directory', { required: true });
  const github = getOctokit(token);
  const result = await run({
    github: github.rest,
    context,
    args: { directory },
  });
  core.setOutput('result', JSON.stringify(result));
}

function handleError(err) {
  console.error(err);
  core.setFailed(`Unhandled error: ${err}`);
}
