const { Octokit } = require('@octokit/rest');

const syncRelease = async () => {
  const { GITHUB_TOKEN, GITHUB_COMMIT } = process.env;

  const owner = 'iheartradio';
  const repo = 'web';

  const octokit = new Octokit({
    auth: GITHUB_TOKEN,
  });

  let commit;

  try {
    const { data } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: GITHUB_COMMIT,
    });

    commit = data;
  } catch (e) {
    console.error(e);
  }

  let user;

  try {
    const { data } = await octokit.search.users({
      q: `${commit.author.email} in:email`,
    });
    [user] = data.items;
  } catch (e) {
    console.error(e);
  }

  const refName = GITHUB_COMMIT.substr(0, 7);
  let createdRef;

  try {
    const { data } = await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/master-release-sync-${refName}`,
      sha: GITHUB_COMMIT,
    });
    createdRef = data.ref;
  } catch (e) {
    console.error(e);
  }

  try {
    // this is silly.
    const message = [
      '@',
      user.login,
      ' has pushed [this commit](',
      'https://github.com/',
      owner,
      '/',
      repo,
      '/commit/',
      GITHUB_COMMIT,
      ') to master with a label of release.',
    ].join('');

    await octokit.pulls.create({
      owner,
      repo,
      head: createdRef,
      base: 'release',
      maintainer_can_modify: true,
      title: 'Test',
      draft: false,
      body: message,
    });
  } catch (e) {
    await octokit.git.deleteRef({
      owner,
      repo,
      ref: createdRef,
    });
  }

  console.log('Successfully created a new pr!');
};

syncRelease();
