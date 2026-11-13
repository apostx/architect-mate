# Roadmap

> **Status:** 2026-11-13 · **Current iteration: 1 (First playable challenge), implemented, in review**

Only the current iteration is a commitment. Later iterations are proposals: their scope is confirmed with the product owner before each one starts. Decisions and open questions are in [design.md](design.md).

| # | Iteration | Version | Status |
|---|---|---|---|
| 0 | Foundations | none (no `feat` commits) | Done |
| 1 | First playable challenge | 0.1.0 | Implemented, in review |

## Iteration 0 — Foundations (done)

- Repository setup: Vite, React, TypeScript, Vitest, Biome, commitlint.
- SolutionValidator installed from its `v0.13.0` release tag ([design.md §3](design.md#3-solutionvalidator-dependency--decided-2026-11-12)), with a test that checks a sample solution against a sample task through the library.
- GitHub Actions: CI (typecheck, lint, tests, build), commit message checks, release-please, GitHub Pages deployment.
- Placeholder page ([design.md §10](design.md#10-iteration-0-shell--decided-2026-11-12)).
- Documentation for online sessions: `CLAUDE.md`, `docs/design.md`, this roadmap, `docs/challenges.md`, `docs/validator-issues.md`.

## Iteration 1 — First playable challenge (approved 2026-11-12)

Goal: the first challenge can be played end to end in the browser.

Decided for this iteration: the challenge is C1, "Serverless orders API" (§11); no points, and the challenge is always decidable (§12); evaluation on a button press (§13); editing interactions and the challenge file format are up to the developer AI (§14, §15).

Scope:

1. **Layout designs first** ([design.md §8](design.md#8-design-validation--decided-2026-11-12-procedure-proposed)): two or three variants of the challenge screen (scenario and requirements, the canvas with the component palette, property editing, results). The product owner chooses one before the UI is implemented (Q7).
2. **Challenge C1** in the chosen file format, with its scenario text, a SolutionValidator task, and test fixtures: at least one reference solution that passes, typical wrong solutions that fail, all decidable. Verify C1 against the library first; report any gap or bug to SolutionValidator.
3. **Visual editing** with `@xyflow/react`: add components from the challenge's palette, connect them with intents (with an action or port where needed), assign roles, and set the properties the challenge needs. Provided components marked `locked` cannot be changed or removed.
4. **Evaluation on a button press** through SolutionValidator: each requirement's `pass` or `fail` with the library's findings and evidence in plain language, the overall result, and a clear message when the solution is incomplete (§12).
5. Placeholder page replaced by the game; app and library versions and the source link stay visible.

Out of scope: points, accounts, persistence, progression, timers, a sandbox mode, more challenges. After the product owner's feedback on the working version, refinements are planned as follow-up work.

Done (2026-11-13):

1. Three layout variants on a Claude Design canvas; the product owner chose B, "canvas first, results drawer" ([design.md §16](design.md#16-challenge-screen-layout--decided-2026-11-13)).
2. C1 verified against SolutionValidator v0.13.0 and implemented in the [challenge format](challenge-format.md), with 15 fixture solutions (3 pass, 11 fail, 1 incomplete), all decidable. Reported [solution-validator#41](https://github.com/apostx/solution-validator/issues/41) to [#45](https://github.com/apostx/solution-validator/issues/45) ([validator-issues.md](validator-issues.md)).
3. Visual editing as described in [design.md §14](design.md#14-editing-interactions--decided-2026-11-12-delegated).
4. Evaluation on the Evaluate button, with the incomplete, evaluated and outdated states.
5. The placeholder page is replaced; the footer keeps the versions and the source link.

Next: the product owner's feedback on the editing interactions (§14), then the release pull request for `0.1.0`.

Release: the iteration's `feat` commits produce `0.1.0`; merge the release pull request when the iteration is complete.

## Later (not scheduled; each item needs approval)

- A guided solution walkthrough: the problems a challenge's solution must cover, then the solution built step by step with explanations of the concepts ([design.md §17](design.md#17-guided-solution-walkthrough--proposed-2026-11-13), Q9).
- More challenges from [challenges.md](challenges.md), from simple to harder.
- System design interview–style challenges, once SolutionValidator can check what they need.
- Scoring, if the product owner wants points later (§12).
- A sandbox mode (Q5).
- Other providers (Azure, on-premises, hybrid), which SolutionValidator already has packs for.
