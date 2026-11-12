# Design decisions

> **Status:** Iteration 1 approved · last updated 2026-11-12

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

When SolutionValidator is published to npm, switch to the npm package. Reported as [solution-validator#29](https://github.com/apostx/solution-validator/issues/29).

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

**Proposed procedure:** before an iteration that changes the UI, prepare two or three design variants of the affected screens (for example as Claude Design prototypes). The product owner chooses one or asks for changes. Record the decision here with a link to the chosen design **and** a short written description of it, so that sessions that cannot open the link still know what was decided. If Claude Design is not available in the session, use another form the product owner can look at, such as static HTML mockups or screenshots of prototype builds. Where an interaction can only be judged in use, build the competing variants behind a switch, let the product owner try them, and remove the one that is not chosen (the approach Domain Map uses for its views).

## 9. Challenge content — Decided (2026-11-12)

The product owner lets the developer AI write the challenges. See [challenges.md](challenges.md) for the candidates and the validation gaps.

- The first challenges are simple.
- Challenges read like scenario questions from AWS certification exams ("Company X wants … How would you design it?"), but the player designs the solution instead of picking an answer.
- Later, challenges may also resemble system design interview problems, where they can be checked.
- A challenge uses only checks SolutionValidator supports. A challenge that needs an unsupported check is not added; the gap is reported to SolutionValidator as an issue ([CLAUDE.md](../CLAUDE.md#reporting-to-solutionvalidator), [validator-issues.md](validator-issues.md)).
- Every challenge ships with a reference solution that passes and typical wrong solutions that fail, as test fixtures, so that a library upgrade cannot silently change a challenge's outcome. Where the vision's "several different architectures can be correct" applies, include more than one passing solution. (Proposed on 2026-11-12, adopted with Iteration 1.)

## 10. Iteration 0 shell — Decided (2026-11-12)

Iteration 0 publishes a placeholder page: the name, a one-line description, an "under construction" note, the versions of the app, the library and its packs, and a link to the source. It is not a UI design; the game UI is designed in Iteration 1.

## 11. First challenge — Decided (2026-11-12)

The first playable challenge is C1, "Serverless orders API" ([challenges.md](challenges.md#c1-serverless-orders-api)).

## 12. Scoring and decidability — Decided (2026-11-12)

- **No points.** The game shows each requirement's result and the overall result; it does not award points. Points may come later, only with the product owner's approval.
- **Challenges are always decidable.** A challenge must be built so that, for a solution the player has completed, every requirement evaluates to `pass` or `fail`, never `undecidable`. The challenge and the game supply what a decision needs: the analysis options (proposed default: the `pack-defaults` assumption policy, so that ordinary settings the challenge does not ask about take the pack's defaults), the roles the requirements select, and the properties the challenge asks the player to set. The tests of every challenge assert that its reference and wrong solutions are decidable.
- If the player's solution is still incomplete (for example a role is not assigned yet), the game tells the player what is missing instead of evaluating it as `fail`.
- If the library returns `undecidable` for a complete solution anyway, the game shows it as `undecidable` with the library's reason, never as `fail` or `pass`. It is a defect: fix the challenge, or, if the library could decide it, report it to SolutionValidator.

## 13. Evaluation timing — Decided (2026-11-12)

The solution is evaluated when the player asks for it (a button), not continuously.

## 14. Editing interactions — Decided (2026-11-12): delegated

The product owner delegated the editing interactions and the logical properties exposed in the first version to the developer AI. Build a working version; the product owner gives feedback on it, and the interactions are refined in further rounds. Record what was built and the feedback in this document. Keep the vision's constraints: clean and minimal, the whole architecture visible, details accessible, no mandatory IP addresses or full infrastructure configuration for conceptual challenges.

## 15. Challenge file format — Decided (2026-11-12): delegated

The product owner delegated the format to the developer AI. Constraints:

- A challenge contains (or references) a SolutionValidator task that the library validates unchanged with `parseTask`. The game does not duplicate what the task already expresses (requirements, provided components, roles).
- Game-only content sits next to it: for example the scenario text, a difficulty, and the component types the player may use.
- Document the format in this document (or a `docs/challenge-format.md` it links to) when it is implemented, and validate challenge files in tests.

## 16. Open questions

These come from the vision or from the work so far. None is decided; ask the product owner before building anything that depends on them.

| # | Question | Notes |
|---|---|---|
| Q5 | Is a sandbox (free design) mode wanted later? | Not a first-release requirement. |
| Q7 | What is the overall layout and navigation? | Validate with designs (§8). |
| Q8 | Should GitHub Pages serve every `main` push or only releases? | Currently every push to `main`. |

Decided: Q1 (§11), Q2 (§12), Q3 (§14), Q4 (§13), Q6 (§15).
