# CLAUDE.md

Guidance for AI coding sessions in this repository. Development continues in online sessions that see only the repository, so every requirement and decision must be recorded here or in `docs/`. Nothing may live only in chat history.

## Read first

1. [docs/product-vision.md](docs/product-vision.md): what the product is and is not. Its "Instructions for the developer AI" section is binding.
2. [docs/design.md](docs/design.md): decisions. Items marked **Decided** are settled; items marked **Proposed** are not requirements yet. Open questions are listed at the end.
3. [docs/roadmap.md](docs/roadmap.md): the iterations. Work only within the scope of the current approved iteration.
4. [docs/challenges.md](docs/challenges.md): the direction for challenge content, candidate challenges and known validation gaps.
5. [docs/validator-issues.md](docs/validator-issues.md): issues reported to SolutionValidator and what they block.
6. SolutionValidator's own docs, for the installed version: `node_modules/solution-validator/README.md` and `node_modules/solution-validator/docs/` (formats, finding codes, component model).

## Rules

- **English everywhere except the chat:** code, identifiers, comments, documentation, UI text, commit messages, pull request titles and descriptions. The product owner writes in Hungarian; reply in the language they use.
- **Conventional Commits** (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, `ci:`, `build:`). Choose the type deliberately, because release-please derives the SemVer bump from it. Breaking changes use `!` or a `BREAKING CHANGE:` footer.
- **Scope:** do not add features, modes, game mechanics (accounts, leaderboards, progression, timers, persistence) or UI flows that are not approved. If something seems essential, propose it separately with a short justification and wait for approval.
- **Ask first** before deciding scoring, evaluation timing, challenge structure, UI flow, persistence or additional modes.
- **Record decisions:** when a proposal or open question is decided, update `docs/design.md` and `docs/roadmap.md` in the same pull request.
- **SolutionValidator owns the model and the validation.** Use its solution and task formats, packs and verdicts. Do not create a competing data model and do not reimplement validation in the game. If a challenge needs a check the library cannot do, explain the gap (see `docs/challenges.md`) instead of faking a result.
- **Report every library gap and bug to SolutionValidator** by opening an issue there (see [Reporting to SolutionValidator](#reporting-to-solutionvalidator)). This is mandatory, not optional.
- **Three-state verdicts:** never show `undecidable` as `fail` or `pass`, and never claim more than the library established.
- **No AI** in validation, scoring or explanations in the product.
- **Static site:** the game runs in the browser on GitHub Pages, with no backend. `src/` must not use Node.js modules (Biome enforces it).
- **UI changes are validated with designs first** (see `docs/design.md`, "Design validation").

## Commands

Requires Node.js 22.18 or newer (see `.nvmrc`) and npm.

| Command | What it does |
|---|---|
| `npm ci` | Install dependencies |
| `npm run check` | Everything CI runs: the commands below, in order |
| `npm run typecheck` | TypeScript for the app (`tsconfig.app.json`) and for tests and configs (`tsconfig.node.json`) |
| `npm run lint` | Biome lint and format check. `npm run format` applies fixes. CI runs `npx biome ci .` |
| `npm test` | Vitest, once. `npm run test:watch` keeps watching. Tests live in `test/**/*.test.ts`. |
| `npm run build` | Production build into `dist/` (what GitHub Pages serves) |
| `npm run dev` / `npm run preview` | Dev server / preview of the production build |
| `npx commitlint --from origin/main` | Check commit messages locally (CI checks every PR commit and the PR title) |

On Windows, run commands from a path with an upper-case drive letter (`C:\projects\...`). From `c:\...`, Vitest loads itself twice and fails with "Cannot read properties of undefined (reading 'config')".

## SolutionValidator dependency

SolutionValidator is not published to npm yet. It is installed from the source tarball of a release tag (`https://codeload.github.com/apostx/solution-validator/tar.gz/refs/tags/vX.Y.Z`) and compiled from source: `vite.config.ts` aliases and `tsconfig.base.json` paths point `solution-validator` and `solution-validator/packs/*` at `node_modules/solution-validator/src/`. The lockfile pins the tarball's integrity hash.

To upgrade: change the tag in `package.json`, run `npm install`, read the library's `CHANGELOG.md` for breaking changes, and run `npm run check`. Upgrade in its own pull request (`build(deps): ...`). When the library is on npm, switch to the npm package and remove the aliases and paths.

Online sessions need network access to `codeload.github.com` and `registry.npmjs.org` for `npm ci`.

## Reporting to SolutionValidator

The product owner decided (2026-11-12): whenever SolutionValidator

- cannot evaluate something that could be decided deterministically, without AI, or
- has a bug, an inconsistency, a misleading finding or a mismatch with its documentation, or
- gets in the way of a consumer in another way (installation, API, packaging),

open an issue in [apostx/solution-validator](https://github.com/apostx/solution-validator/issues). Do not work around it with validation logic in the game.

1. Search the existing issues first (`gh issue list -R apostx/solution-validator --state all --search "<keywords>"`) and comment on a matching one instead of opening a duplicate.
2. Write the issue in English. Start the body with "Reported by [ArchitectMate](https://github.com/apostx/architect-mate), a consumer of this library." Include: what the game needs and why (for example the challenge it blocks), a minimal solution and task JSON that reproduces it, the expected and the actual result (verdicts and finding codes), and the library version. Describe possible fixes as options; the library's maintainer decides.
3. Label it `bug` for defects and `enhancement` for missing capabilities.
4. Add it to [docs/validator-issues.md](docs/validator-issues.md) with its link, what it blocks and the workaround, if any. Mention it in the pull request description and in the reply to the product owner.
5. If the session cannot create issues in that repository (for example no GitHub access to it), put the complete issue text into `docs/validator-issues.md` with the status "Draft, not filed" and ask the product owner to file it.

Until the issue is resolved, leave the affected challenge out, or keep it out of the game, rather than faking a result.

## Branches, merging and releases

- Every change reaches `main` through a branch and a pull request. Prefer one iteration or one feature per pull request.
- Merge with **rebase and merge** (or squash, with a Conventional Commit title). release-please walks `main` back to the last release commit and does not see commits that are only reachable through a merge commit.
- release-please owns `CHANGELOG.md`, `.release-please-manifest.json` and the version in `package.json`. Do not edit them by hand.
- Versions stay at `0.x`, one minor version per iteration. Merge the release pull request when an iteration is complete.
- Every push to `main` deploys the app to GitHub Pages.
