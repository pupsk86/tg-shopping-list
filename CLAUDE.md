# tg-shopping-list

A Telegram mini app for shopping lists. V1 runs offline on the device; V2 adds a Java server. See `docs/` before starting any work.

## Project docs

Decisions are recorded one file per workflow step, and every session reads the ones that touch its work:

- `GLOSSARY.md`: the domain terms. Use them in code, tests, issues and PRs.
- `docs/01-app-design.md`: product decisions by release.
- `docs/02-architecture.md`: architecture and tech stack.
- `docs/04-mvp-milestone.md`: the V1 MVP milestone spec.
- `docs/adr/`: decisions that are hard to reverse. Don't contradict one silently; raise it.

New decisions go into the step's doc or a new ADR in the same PR as the change.

## Agent skills

Matt Pocock's skills are in `.claude/skills/` (see its README).

### Issue tracker

GitHub Issues in this repo, grouped under one parent issue per spec. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
