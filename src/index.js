import { Octokit } from "@octokit/rest";

class GithubCommitSummary {
    constructor({ github_token, github_username, date_range }) {
        this.github_token = github_token;
        this.github_username = github_username;
        this.date_range = date_range
        this.octokit = new Octokit({
            auth: this.github_token,
        });
    }

    getDateRange(date_range) {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - date_range);
        const endOfWeek = new Date(today);
        return { startOfWeek, endOfWeek };
    }

    async getUserRepos(since) {
        let repositories = new Set();
        try {
            const result = await this.octokit.search.commits({
                q: `author:${this.github_username} committer-date:>${since}`,
                sort: 'committer-date',
                order: 'desc',
                per_page: 100
            });

            result.data.items.forEach(commit => {
                repositories.add(commit.repository.full_name);
            });
        } catch (error) {
            console.error("Failed to fetch commits:", error);
        }
        return Array.from(repositories);
    }

    async getDefaultBranch(repoFullName) {
        try {
            const response = await this.octokit.repos.get({
                owner: repoFullName.split('/')[0],
                repo: repoFullName.split('/')[1],
            });

            return response.data.default_branch;
        } catch (error) {
            console.error(`Failed to fetch repository info for ${repoFullName}:`, error);
            return null;
        }
    }

    async getCommitMessages(repoFullName, branch = 'main', since, until) {
        let commitMessages = [];
        try {
            const defaultBranch = await this.getDefaultBranch(repoFullName);
            if (!defaultBranch) {
                console.log(`Could not determine default branch for ${repoFullName}. Skipping.`);
                return [];
            }

            branch = branch === 'main' ? defaultBranch : branch;

            const commits = await this.octokit.repos.listCommits({
                owner: repoFullName.split('/')[0],
                repo: repoFullName.split('/')[1],
                sha: branch,
                since: since.toISOString(),
                until: until.toISOString(),
                per_page: 50,
            });

            commitMessages = commits.data.map(commit => commit.commit.message);
        } catch (error) {
            console.error(`Failed to fetch commits for ${repoFullName}:`, error);
        }
        return commitMessages;
    }

    async fetchCommitData() {
        const { startOfWeek, endOfWeek } = this.getDateRange(this.date_range);
        const sinceDate = startOfWeek.toISOString();
        const untilDate = endOfWeek.toISOString();

        const repositories = await this.getUserRepos(sinceDate);

        let summary = [];

        if (repositories.length === 0) {
            console.log("No repositories found with commits this week.");
        } else {
            for (const repo of repositories) {
                const commitMessages = await this.getCommitMessages(repo, 'main', new Date(sinceDate), new Date(untilDate));
                if (commitMessages.length > 0) {
                    summary.push({
                        repository: repo,
                        commits: commitMessages
                    });
                } else {
                    console.log("No commit messages found or failed to fetch commit messages.");
                }
            }
        }

        return summary;
    }
}

export { GithubCommitSummary };
