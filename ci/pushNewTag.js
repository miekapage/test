const { Octokit } = require('@octokit/rest');
const { version } = require('../package.json');
const pushNewTag = async () => {
  const { GITHUB_TOKEN, COMMIT } = process.env;
  if (!GITHUB_TOKEN) return console.log('You did not supply a Github token');
  if (!COMMIT) return console.log('you did not supply a github commit');

  const owner = "youthwar";
  const repo = "test"

  const octokit = new Octokit({
    auth: GITHUB_TOKEN,
  });

  const { data: tags } = await octokit.repos.listTags({
    owner: 'youthwar',
    repo: 'test',
  });

  const versionRegex = /[0-9]+.[0-9]+.[0-9]/gi;
  const rcNumberRegex = /[0-9]+$/i;
  const [packageVersion] = version.match(versionRegex);

  // here we use the package version as the source of truth.
  const foundTags = tags.filter((tag) => {
    const [nonRcTagName] = tag.name.match(versionRegex);
    return nonRcTagName === packageVersion;
  });

  let newVersionNumber;
  let newRcNumber;

  if (foundTags.length) {
    // any version at this point is acceptable
    newVersionNumber = foundTags[0].name.match(versionRegex)[0];
    let latestRcNumber = 0;
    // iterating here to find what the latest rc number should be.
    foundTags.forEach((tag) => {
      let rcCandidate = parseInt(tag.name.match(rcNumberRegex)[0], 10);
      latestRcNumber = latestRcNumber >=  rcCandidate ? latestRcNumber : rcCandidate;
    });
    newRcNumber = latestRcNumber + 1;
  } else {

    newVersionNumber = packageVersion;
    newRcNumber = 0;
  }

  const newTag = `v${newVersionNumber}-rc.${newRcNumber}`;

  const { data } = await octokit.git.createTag({
    owner,
    repo,
    tag: newTag,
    message: newTag,
    object: COMMIT,
    type: 'commit',
  });

  const newResult = await octokit.git.createRef({
    owner,
    repo,
    ref: `refs/tags/${newTag}`,
    sha: data.sha,
  });

  console.log(newResult);
  

  console.log(newTag);
};

pushNewTag();
