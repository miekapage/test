const { Octokit } = require('@octokit/rest');

const syncRelease = async () => {
  const { GITHUB_TOKEN, COMMIT } = process.env;
  
  const owner = "youthwar";
  const repo = "test"

  const octokit = new Octokit({
    auth: GITHUB_TOKEN,
  });

  const result = await octokit.pulls.create({
    owner,
    repo,
    head: 'master',
    base: 'release',
    maintainer_can_modify: true,
    draft: false,
  });

  console.log({ result })

};

syncRelease();