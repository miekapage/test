const { graphql } = require('@octokit/graphql');

async function checkIfReleasePR() {
  const { GITHUB_COMMIT, GITHUB_TOKEN } = process.env;

  if (!GITHUB_TOKEN) return console.error('You did not supply a Github token');

  try {
    const query = await graphql({
      query: `query associatedPRs($sha: String, $repo: String!, $owner: String!) {
        repository(name: $repo, owner: $owner) {
          commit: object(expression: $sha) {
            ... on Commit {
              associatedPullRequests(first:1) {
                edges {
                  node {
                    baseRefName
                    closed
                    labels(first:100) {
                      edges {
                        node {
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }`,
      headers: { authorization: `token ${GITHUB_TOKEN}` },
      owner: 'iheartradio',
      repo: 'web',
      sha: GITHUB_COMMIT,
    });

    const pr = query.repository.commit.associatedPullRequests.edges[0] || {};

    const {
      baseRefName,
      closed,
      labels: { edges = [] },
    } = pr.node || { labels: {} };

    let releasePR;

    if (closed && baseRefName === 'master') {
      const { node } = edges.find(({ node: { name } }) => name === 'RELEASE') || {};
      releasePR = node;
      console.log(`PR ${node ? 'has' : 'does not have'} label "RELEASE"`);
    } else if (!closed) {
      console.log('PR not closed');
    } else {
      console.log('PR not to master');
    }
    console.log(`releasePR = ${releasePR}`);

    return releasePR;
  } catch (e) {
    return console.error(e);
  }
}

module.exports = checkIfReleasePR;
