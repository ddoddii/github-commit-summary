# github-commit-summary

This package summarizes the commit messages from a user's repositories on GitHub.

## Installation

```bash
npm install github-commit-summary
```

## How to use

```javascript
const github_token = {your_github_token};
const github_username = {your_github_username};
const date_range = {date_range_for_history};

const pkg = new GithubCommitSummary({ github_token: github_token, github_username: github_username, date_range: 14 });
var commits = await pkg.fetchCommitData();
console.log(commits)
```