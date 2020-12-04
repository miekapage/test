const { Octokit } = require('@octokit/rest');

const syncRelease = async () => {
  const { GITHUB_TOKEN, COMMIT } = process.env;

  const owner = "youthwar";
  const repo = "test"

  const octokit = new Octokit({
    auth: GITHUB_TOKEN,
  });
  console.log(COMMIT)
  const commit = await octokit.git.getCommit({
    owner,
    repo,
    commit_sha: COMMIT,
  });

  const { data } = await octokit.search.users({
    q: `${commit.data.author.email} in:email`
  });

  const [ user ] = data.items;

  console.log({ user });
  
  const result = await octokit.pulls.create({
    owner,
    repo,
    head: 'master',
    base: 'release',
    maintainer_can_modify: true,
    title: 'Test',
    draft: false,
    body: `
      @${user.login} has committed this branch to master with a label of release.
      The original commit can be found [here](https://github.com/${owner}/${repo}/commit/${COMMIT})
    `
  });
  
  
  console.log({ result })
   
};

syncRelease();