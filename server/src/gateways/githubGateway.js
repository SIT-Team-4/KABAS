// Queries the first ProjectV2 board only — we assume one Kanban board per repo.
const PROJECT_BOARD_QUERY = `
query($owner: String!, $repo: String!, $cursor: String) {
  repository(owner: $owner, name: $repo) {
    projectsV2(first: 1) {
      nodes {
        items(first: 100, after: $cursor) {
          pageInfo { hasNextPage, endCursor }
          nodes {
            content {
              ... on Issue { number }
            }
            fieldValueByName(name: "Status") {
              ... on ProjectV2ItemFieldSingleSelectValue { name }
            }
          }
        }
      }
    }
  }
}
`;

export async function fetchIssues(octokit, owner, repo) {
    const issues = await octokit.paginate('GET /repos/{owner}/{repo}/issues', {
        owner,
        repo,
        state: 'all',
        per_page: 100,
    });

    return issues.filter((issue) => !issue.pull_request);
}

export async function fetchIssueTimeline(octokit, owner, repo, issueNumber) {
    const events = await octokit.paginate('GET /repos/{owner}/{repo}/issues/{issue_number}/timeline', {
        owner,
        repo,
        issue_number: issueNumber,
        per_page: 100,
    });

    return events;
}

const MAX_PAGES = 50;

export async function fetchProjectBoardStatuses(octokit, owner, repo) {
    const allItems = [];
    let cursor = null;
    let hasNextPage = true;
    let page = 0;

    while (hasNextPage && page < MAX_PAGES) {
        page++;
        // eslint-disable-next-line no-await-in-loop
        const response = await octokit.graphql(PROJECT_BOARD_QUERY, {
            owner,
            repo,
            cursor,
        });

        const project = response.repository.projectsV2.nodes[0];
        if (!project) break;

        const { items } = project;
        allItems.push(...items.nodes);

        hasNextPage = items.pageInfo.hasNextPage;
        cursor = items.pageInfo.endCursor;
    }

    return allItems;
}
