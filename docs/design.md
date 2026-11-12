# Design decisions

> **Status:** Iteration 0 (foundations) · last updated 2026-11-12

This document records the decisions about ArchitectMate. Items marked **Decided** are settled by the product owner. Items marked **Proposed** are suggestions and are not requirements until approved. The [product vision](product-vision.md) states the intent; where a decision here is more specific, this document wins.

## 1. Relationship with SolutionValidator — Decided

From the vision: ArchitectMate is a separate application that consumes [SolutionValidator](https://github.com/apostx/solution-validator).

- The library owns the solution model, the component types (packs), the analyses and the requirement verdicts (`pass`, `fail`, `undecidable`, with findings and evidence).
- The game owns the player experience: showing challenges, editing a solution visually, presenting results and, once its rules are approved, scoring.
- The game uses the library's solution and task formats and packs. It does not define a competing data model and does not reimplement validation.
- The game never shows `undecidable` as `fail` and never claims that something was verified when the library could not establish it.
- Game-specific content that the library does not model, such as a challenge's scenario text, lives in the game's own files next to the library's task (see the open question about the challenge format).

## 2. Technology stack — Decided (2026-11-12)

| Area | Choice | Why |
|---|---|---|
| Language | TypeScript | Same as SolutionValidator and Domain Map |
| UI | React | Used by the SolutionValidator demo and the Domain Map viewer |
| Diagram canvas | `@xyflow/react` | Proven in both existing projects; added when the first editing UI is built |
| Build | Vite | Same as both existing projects; static output for GitHub Pages |
| Tests | Vitest | Same as both existing projects |
| Lint and format | Biome | Same as SolutionValidator |
| Commit checks | commitlint with the conventional config | Same as both existing projects |

Proposed, not decided: `elkjs` for automatic layout (Domain Map uses it) only if a feature needs automatic layout.

The Domain Map viewer has more UI experience to reuse (navigation, zoom, layout). Before building a comparable UI feature, review how Domain Map solves it, and reuse what fits. Domain Map is Apache-2.0; code taken from it keeps its notice.

## 3. SolutionValidator dependency — Decided (2026-11-12)

The product owner chose to depend on a release tag of the library rather than an npm package. SolutionValidator is not on npm yet, and an npm `github:` dependency does not build it (npm packs only `dist`, `packs` and `schemas`, and `dist` is not committed). The game therefore installs the source tarball of the release tag from `codeload.github.com` and compiles the library from source, the way the library's own demo does. The lockfile pins the tarball's integrity hash. See [CLAUDE.md](../CLAUDE.md#solutionvalidator-dependency) for the upgrade procedure.

When SolutionValidator is published to npm, switch to the npm package.

## 4. Hosting — Decided (2026-11-12)

A static site on GitHub Pages, built and deployed by GitHub Actions on every push to `main`. No backend. Asset URLs are relative, so the build works under `/architect-mate/`.

## 5. Versioning and releases — Decided (2026-11-12)

- Semantic Versioning, managed by release-please from Conventional Commits on `main`.
- Versions stay at `0.x`, one minor version per iteration. The first release, `0.1.0`, comes with the first `feat` commit (Iteration 1); Iteration 0 has no `feat` commits.
- Pull requests are rebase-merged (or squash-merged with a Conventional Commit title).
- The app shows its own version and the SolutionValidator version.

## 6. License — Decided (2026-11-12)

`AGPL-3.0-only`, the same as SolutionValidator. The game bundles the library into the browser build and is served publicly, so the combined work is distributed under the AGPL. The app links to its source code.

## 7. Language — Decided (2026-11-12)

Everything in the repository and the product is in English: code, documentation, UI text, commit messages, pull requests. Only the chat with the product owner is in Hungarian.

## 8. Design validation — Decided (2026-11-12), procedure Proposed

**Decided:** UI work is validated with designs before it is implemented. Claude Design may be used for this.

**Proposed procedure:** before an iteration that changes the UI, prepare two or three design variants of the affected screens (for example as Claude Design prototypes). The product owner chooses one or asks for changes. Record the decision here with a link to the chosen design **and** a short written description of it, so that sessions that cannot open the link still know what was decided. Where an interaction can only be judged in use, build the competing variants behind a switch, let the product owner try them, and remove the one that is not chosen (the approach Domain Map uses for its views).

## 9. Challenge content — Decided (2026-11-12)

The product owner lets the developer AI write the challenges. See [challenges.md](challenges.md) for the candidates and the validation gaps.

- The first challenges are simple.
- Challenges read like scenario questions from AWS certification exams ("Company X wants … How would you design it?"), but the player designs the solution instead of picking an answer.
- Later, challenges may also resemble system design interview problems, where they can be checked.
- A challenge uses only checks SolutionValidator supports. A challenge that needs an unsupported check is not added; the gap is raised instead (vision: "explain the gap rather than faking a result").

Proposed: every challenge ships with a reference solution that passes and typical wrong solutions that fail, as test fixtures, so that a library upgrade cannot silently change a challenge's outcome. Where the vision's "several different architectures can be correct" applies, include more than one passing solution.

## 10. Iteration 0 shell — Decided (2026-11-12)

Iteration 0 publishes a placeholder page: the name, a one-line description, an "under construction" note, the versions of the app, the library and its packs, and a link to the source. It is not a UI design; the game UI is designed in Iteration 1.

## 11. Open questions

These come from the vision or from the work so far. None is decided; ask the product owner before building anything that depends on them.

| # | Question | Notes |
|---|---|---|
| Q1 | What is the first playable challenge? | Candidate: "Serverless orders API" ([challenges.md](challenges.md#c1-serverless-orders-api)). |
| Q2 | How are points, success criteria and `undecidable` results handled? | The library does not score. Task and requirement `meta` can carry weights (for example `points`). |
| Q3 | Which editing interactions and logical properties does the first version expose? | Depends on the challenge; validate with designs (§8). |
| Q4 | Does evaluation run continuously or only when the player asks? | |
| Q5 | Is a sandbox (free design) mode wanted later? | Not a first-release requirement. |
| Q6 | What is the challenge file format? | Proposed: a game file with the scenario text and presentation data, wrapping or referencing a SolutionValidator task. |
| Q7 | What is the overall layout and navigation? | Validate with designs (§8). |
| Q8 | Should GitHub Pages serve every `main` push or only releases? | Currently every push to `main`. |
