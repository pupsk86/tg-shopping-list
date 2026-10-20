# Issue tracker: GitHub

Issues and specs for this repo live as GitHub Issues in `pupsk86/tg-shopping-list`.

## Tools

- In Claude Code cloud sessions there is no `gh` CLI: use the GitHub MCP tools (`issue_write`, `issue_read`, `list_issues`, `search_issues`, `add_issue_comment`).
- On a local machine, `gh issue ...` works the same way.

## Conventions

- **Specs** live in the repo under `docs/` (one file per workflow step), not in issues. An issue links to the spec it comes from.
- **Parent issue**: the tickets of one spec are sub-issues of one parent issue named after it, for example #5 **V1 MVP** for `docs/04-mvp-milestone.md`. (GitHub milestones and labels can't be created with the GitHub MCP tools, so we don't rely on them.)
- **Blocking**: put a `Blocked by: #<n>, #<n>` line at the top of the issue body. A ticket is ready when the PRs for every issue it lists are merged; their manual QA may still be running.
- **Who does it**: a ticket is for an agent by default. A ticket only a person can do (accounts, settings) has a `[For <name>]` title prefix and is assigned to that person.
- **Manual QA**: every ticket that changes the app ends with a `## Manual QA` section: numbered test cases, each with steps and the expected result, to run in Telegram on a phone. Its acceptance criteria include "Kosta has run the manual QA cases and noted the results on this issue."
- **Closing**: the PR that implements a ticket says `Part of #<n>`, never `Closes #<n>`, so merging doesn't close the ticket. Kosta closes it once the manual QA cases pass.
- **QA bugs**: Kosta notes failed cases as comments on the ticket. Each one is fixed in a PR that says `Part of #<n>`, and the ticket stays open until the cases pass.
- **Comments** on the issue carry any discussion or follow-ups.

## When a skill says "publish to the issue tracker"

Create a GitHub issue as a sub-issue of the spec's parent issue, following the conventions above.

## When a skill says "fetch the relevant ticket"

Read the issue with its comments (`issue_read`, or `gh issue view <n> --comments`).
