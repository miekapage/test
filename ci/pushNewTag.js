const { Octokit } = require('@octokit/rest');
const { version } = require('../package.json');
const pushNewTag = async () => {
  const { TOKEN, COMMIT } = process.env;
  if (!TOKEN) return console.log('You did not supply a token');
  if (!COMMIT) return console.log('you did not supply a github commit');

  const owner = "youthwar";
  const repo = "test"

  const octokit = new Octokit({
    auth: TOKEN,
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
    const { name } = foundTags[0];
    [newVersionNumber] = name.match(versionRegex);

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

  const { status } = await octokit.git.createRef({
    owner,
    repo,
    ref: `refs/tags/${newTag}`,
    sha: data.sha,
  });

  
  console.log(status);
  
  if (status === 201) {
    console.log('success');
    console.log(newTag);
  }
  
};

pushNewTag();
