# Issue tracker: GitHub

Issues and specs for this repo live as GitHub Issues in `pupsk86/tg-shopping-list`.

## Tools

- In Claude Code cloud sessions there is no `gh` CLI: use the GitHub MCP tools (`issue_write`, `issue_read`, `list_issues`, `search_issues`, `add_issue_comment`).
- On a local machine, `gh issue ...` works the same way.

## Conventions

- **Specs** live in the repo under `docs/` (one file per workflow step), not in issues. An issue links to the spec it comes from.
- **Milestones** group the tickets of one spec, for example **V1 MVP** for `docs/04-mvp-milestone.md`.
- **Blocking**: put a `Blocked by: #<n>, #<n>` line at the top of the issue body. A ticket is ready when every issue it lists is closed.
- **Labels**: tickets produced by `to-tickets` get `ready-for-agent`; a ticket only a person can do (accounts, settings) gets `ready-for-human`.
- **Closing**: the PR that implements a ticket says `Closes #<n>` in its body.
- **Comments** on the issue carry any discussion or follow-ups.

## When a skill says "publish to the issue tracker"

Create a GitHub issue in the milestone, with the labels above.

## When a skill says "fetch the relevant ticket"

Read the issue with its comments (`issue_read`, or `gh issue view <n> --comments`).
