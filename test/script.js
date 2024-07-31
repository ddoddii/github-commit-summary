import { GithubCommitSummary } from 'github-commit-summary';
import dotenv from 'dotenv';

dotenv.config();

const github_token = process.env.GITHUB_TOKEN;
const github_username = process.env.GITHUB_USERNAME;

const pkg = new GithubCommitSummary({ github_token: github_token, github_username: github_username, date_range: 14 });

var commits = await pkg.fetchCommitData();
console.log(commits)