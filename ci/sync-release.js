const { Octokit } = require('@octokit/rest');

const syncRelease = async () => {
  const { GITHUB_TOKEN, COMMIT } = process.env;

  const owner = "youthwar";
  const repo = "test"

  const octokit = new Octokit({
    auth: GITHUB_TOKEN,
  });

  const { data: commit } = await octokit.git.getCommit({
    owner,
    repo,
    commit_sha: COMMIT,
  });

  const { data } = await octokit.search.users({
    q: `${commit.author.email} in:email`
  });

  const [ user ] = data.items;

  console.log({ user });

  const refName = COMMIT.substr(0,7);
  let createdRef;

  try {
    const { data } = await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/master-release-sync-${refName}`,
      sha: COMMIT,
    });
    createdRef = data.ref;
  } catch (e) {
    
  }

  console.log(createdRef);
  try {
    const result = await octokit.pulls.create({
      owner,
      repo,
      head: createdRef.ref,
      base: 'release',
      maintainer_can_modify: true,
      title: 'Test',
      draft: false,
      body: `
        @${user.login} has committed this branch to master with a label of release.
        The original commit can be found [here](https://github.com/${owner}/${repo}/commit/${COMMIT})
      `
    });
  } catch (e) {
    console.log(e);

  }
  
  
  console.log({ result })
  
};

syncRelease();