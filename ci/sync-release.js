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
    // cant create a branch!
  }
  

  try {
    // this is silly.
    const message  = [
      "@",
      user.login,
      " has pushed [this commit](",
      "https://github.com/",
      owner,
      "/",
      repo,
      "/commit/",
      COMMIT,
      ") to master with a label of release."
    ].join('');

    await octokit.pulls.create({
      owner,
      repo,
      head: createdRef,
      base: 'release',
      maintainer_can_modify: true,
      title: 'Test',
      draft: false,
      body: message
    });
  } catch (e) {
    console.log(e);
    console.log('uh oh, cleaning up the branch because a pr could not be created');
    await octokit.git.deleteRef({
      owner,
      repo,
      ref: createdRef,
    });

  }

  console.log('successful')
  
};

syncRelease();