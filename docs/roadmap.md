# Roadmap

> **Status:** Iteration 0 in progress · 2026-11-12 · **Current iteration: 0 (Foundations)**

Only the current iteration is a commitment. Later iterations are proposals: their scope is confirmed with the product owner before each one starts. Open questions are listed in [design.md](design.md#11-open-questions).

| # | Iteration | Version | Status |
|---|---|---|---|
| 0 | Foundations | none (no `feat` commits) | In progress |
| 1 | First playable challenge | 0.1.0 | Proposed, needs approval |

## Iteration 0 — Foundations

- Repository setup: Vite, React, TypeScript, Vitest, Biome, commitlint.
- SolutionValidator installed from its `v0.13.0` release tag ([design.md §3](design.md#3-solutionvalidator-dependency--decided-2026-11-12)), with a test that checks a sample solution against a sample task through the library.
- GitHub Actions: CI (typecheck, lint, tests, build), commit message checks, release-please, GitHub Pages deployment.
- Placeholder page ([design.md §10](design.md#10-iteration-0-shell--decided-2026-11-12)).
- Documentation for online sessions: `CLAUDE.md`, `docs/design.md`, this roadmap, `docs/challenges.md`.

## Iteration 1 — First playable challenge (proposed)

Goal: one simple challenge can be played end to end. Before it starts, decide Q1–Q4, Q6 and Q7, and validate the screens with designs ([design.md §8](design.md#8-design-validation--decided-2026-11-12-procedure-proposed)).

Proposed scope, to be confirmed:

- One challenge, for example "Serverless orders API" ([challenges.md](challenges.md#c1-serverless-orders-api)), with its scenario text and requirements.
- Visual editing: add components from the challenge's palette, connect them with intents, set the properties the challenge needs.
- Evaluation through SolutionValidator, with each requirement's `pass`, `fail` or `undecidable` result and the library's findings.
- Tests: the challenge's reference solution passes; typical wrong solutions fail.

## Later (not scheduled; each item needs approval)

- More challenges from [challenges.md](challenges.md), from simple to harder.
- System design interview–style challenges, once SolutionValidator can check what they need.
- Scoring, once its rules are agreed (Q2).
- A sandbox mode (Q5).
- Other providers (Azure, on-premises, hybrid), which SolutionValidator already has packs for.
