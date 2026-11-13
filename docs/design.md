# Design decisions

> **Status:** Iteration 1 implemented, in review · last updated 2026-11-13

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
| Diagram canvas | `@xyflow/react` | Proven in both existing projects; added in Iteration 1. The canvas follows the SolutionValidator demo's approach (controlled nodes, positions in `meta`) |
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

**Used in Iteration 1 (2026-11-12):** three variants of the challenge screen as a Claude Design canvas: <https://claude.ai/artifact/83pwgpueQG7z8RaG1vjsVe> (private to the product owner). The chosen one is recorded in §16.

## 9. Challenge content — Decided (2026-11-12)

The product owner lets the developer AI write the challenges. See [challenges.md](challenges.md) for the candidates and the validation gaps.

- The first challenges are simple.
- Challenges read like scenario questions from AWS certification exams ("Company X wants … How would you design it?"), but the player designs the solution instead of picking an answer.
- Later, challenges may also resemble system design interview problems, where they can be checked.
- A challenge uses only checks SolutionValidator supports. A challenge that needs an unsupported check is not added; the gap is reported to SolutionValidator as an issue ([CLAUDE.md](../CLAUDE.md#reporting-to-solutionvalidator), [validator-issues.md](validator-issues.md)).
- Every challenge ships with a reference solution that passes and typical wrong solutions that fail, as test fixtures, so that a library upgrade cannot silently change a challenge's outcome. Where the vision's "several different architectures can be correct" applies, include more than one passing solution. (Proposed on 2026-11-12, adopted with Iteration 1.)

## 10. Iteration 0 shell — Decided (2026-11-12)

Iteration 0 publishes a placeholder page: the name, a one-line description, an "under construction" note, the versions of the app, the library and its packs, and a link to the source. It is not a UI design; the game UI is designed in Iteration 1. **Replaced in Iteration 1** by the challenge screen (§16); the versions and the source link stay in its footer.

## 11. First challenge — Decided (2026-11-12)

The first playable challenge is C1, "Serverless orders API" ([challenges.md](challenges.md#c1-serverless-orders-api)).

## 12. Scoring and decidability — Decided (2026-11-12)

- **No points.** The game shows each requirement's result and the overall result; it does not award points. Points may come later, only with the product owner's approval.
- **Challenges are always decidable.** A challenge must be built so that, for a solution the player has completed, every requirement evaluates to `pass` or `fail`, never `undecidable`. The challenge and the game supply what a decision needs: the analysis options (proposed default: the `pack-defaults` assumption policy, so that ordinary settings the challenge does not ask about take the pack's defaults), the roles the requirements select, and the properties the challenge asks the player to set. The tests of every challenge assert that its reference and wrong solutions are decidable. **Adopted with Iteration 1:** every challenge so far uses `pack-defaults` ([challenge-format.md](challenge-format.md)).
- If the player's solution is still incomplete (for example a role is not assigned yet), the game tells the player what is missing instead of evaluating it as `fail`.
- If the library returns `undecidable` for a complete solution anyway, the game shows it as `undecidable` with the library's reason, never as `fail` or `pass`. It is a defect: fix the challenge, or, if the library could decide it, report it to SolutionValidator.

## 13. Evaluation timing — Decided (2026-11-12)

The solution is evaluated when the player asks for it (a button), not continuously.

## 14. Editing interactions — Decided (2026-11-12): delegated

The product owner delegated the editing interactions and the logical properties exposed in the first version to the developer AI. Build a working version; the product owner gives feedback on it, and the interactions are refined in further rounds. Record what was built and the feedback in this document. Keep the vision's constraints: clean and minimal, the whole architecture visible, details accessible, no mandatory IP addresses or full infrastructure configuration for conceptual challenges.

**Built in Iteration 1 (2026-11-13), awaiting the product owner's feedback:**

- **Adding components:** drag a type from the palette onto the canvas, or click it to place it to the right of the others (the view pans to it). New components are named after their type ("Lambda function 1"); the player can rename them.
- **Connecting:** drag from a component's right handle to another component's left handle. The connection's action comes from what the target's type accepts (its `accepts` rules in the pack, from any source, so the player can draw a wrong connection and the library explains why it fails). One possible action is set directly; with several (for example read or write), a small chooser asks. The port is set when the action implies a single one (API Gateway: https; see [solution-validator#43](https://github.com/apostx/solution-validator/issues/43)). A connection's action can be changed in the inspector.
- **Inspector:** selecting a component shows its type's description, its name, the challenge's roles as checkboxes, and the properties the challenge's palette exposes, edited from the pack's property schemas (enumerations as selects with the default marked, booleans as checkboxes, lists such as routes and permissions as rows with Add and Remove). A new list row is filled in, preferring the components this one connects to. Provided components are locked: they can be moved, but not edited or deleted.
- **Deleting:** the inspector's Delete button, or Delete/Backspace on the canvas. Deleting a component also deletes its connections and the references to it in other components' settings (for example a permission on a deleted table), so the solution stays valid.
- **Evaluating:** the Evaluate button. The results drawer opens below the canvas and the view fits the whole design. An incomplete solution (a role not assigned, or errors the library reports) is not evaluated; the drawer says what is missing. Otherwise it shows the overall result, each requirement's verdict with the library's evidence, and every connection's verdict with the evidence of the checks that did not pass; the connections on the canvas take their verdict's color (pass solid, fail dashed, undecidable dotted). After any change other than moving a component, the results are kept but marked as outdated and the canvas colors are removed, until the next evaluation.
- **Wording:** evidence is rendered from the library's codes and parameters with the player's names, and says "connection" and "permission" where the library says "intent" and "grant" (`src/game/messages.ts`). No reason is added that the library did not give.
- **Not built:** undo, saving the design (persistence is not approved), keyboard-only connecting.

## 15. Challenge file format — Decided (2026-11-12): delegated

The product owner delegated the format to the developer AI. Constraints:

- A challenge contains (or references) a SolutionValidator task that the library validates unchanged with `parseTask`. The game does not duplicate what the task already expresses (requirements, provided components, roles).
- Game-only content sits next to it: for example the scenario text, a difficulty, and the component types the player may use.
- Document the format in this document (or a `docs/challenge-format.md` it links to) when it is implemented, and validate challenge files in tests.

**Implemented (2026-11-12):** [challenge-format.md](challenge-format.md). One JSON file per challenge with the task inline; the palette lists the types and the editable properties; positions on the canvas live in the library's `meta`; fixture solutions carry their expected result in `meta.expected`.

## 16. Challenge screen layout — Decided (2026-11-13)

The product owner chose **variant B, "canvas first, results drawer"**, from the three Iteration 1 designs (§8). Implemented in `src/ui/`:

- **Top bar:** the game's name, the challenge title and difficulty, a Show/Hide brief button, and the Evaluate solution button.
- **Brief:** a strip under the top bar with the scenario on the left and the numbered requirements on the right, with the roles to assign. It can be hidden to give the canvas more room.
- **Canvas:** fills the rest of the screen. The palette floats at its top left; the inspector of the selected component or connection floats at its top right and closes with its close button or by clicking the empty canvas. Zoom controls sit at the bottom left.
- **Results drawer:** appears under the canvas after the first evaluation: the overall result and how many requirements are met on one line, then the requirements and the connections in two columns. It can be collapsed to that one line.
- **Footer:** the versions of the app, SolutionValidator and its packs, and the source link.
- On narrow screens the palette becomes a scrolling row at the top of the canvas and the inspector a sheet at its bottom.

## 17. Guided solution walkthrough — Proposed (2026-11-13)

The product owner raised the idea on 2026-11-13; it is not approved for an iteration yet.

**The idea:** a step-by-step solver for a challenge that first lists the problems the solution has to cover (an interpretation of the scenario), then builds the solution one step at a time, showing the diagram with each new component and its settings and explaining why. It would make both the game's expectations and the architect's way of thinking visible, and anchor the key concepts (for example fault tolerance or eventual consistency) in a concrete design.

**How it could fit the rules (developer AI's proposal):**

- The walkthrough is written content in the challenge file, authored and reviewed like the scenario. Nothing is generated at run time, so "no AI in the product" holds.
- Each step is a SolutionValidator solution (the previous step plus a change) with a short explanation and the concepts it introduces. The game evaluates each step through the library and shows which requirements it meets, so the walkthrough demonstrates the same checks the player's design goes through, and tests can assert that the steps progress and that the last one passes.
- A concept is only presented as checked when the library checks it. Concepts the library cannot check yet (consistency models, [solution-validator#40](https://github.com/apostx/solution-validator/issues/40)) can be explained, but are labelled as not verified by the game.

**Questions for the product owner before it is scheduled:**

- When is it available: at any time, only after the player has evaluated at least once, or as a separate learning mode next to the challenge?
- Does it show one reference solution, or also the typical mistakes (the failing fixtures) and why they fail?
- Should the key concepts get a short glossary that the steps link to, and should it be shared across challenges?

## 18. Open questions

These come from the vision or from the work so far. None is decided; ask the product owner before building anything that depends on them.

| # | Question | Notes |
|---|---|---|
| Q5 | Is a sandbox (free design) mode wanted later? | Not a first-release requirement. |
| Q8 | Should GitHub Pages serve every `main` push or only releases? | Currently every push to `main`. |
| Q9 | Should the guided solution walkthrough (§17) be built, and in which form? | Proposed on 2026-11-13. |

Decided: Q1 (§11), Q2 (§12), Q3 (§14), Q4 (§13), Q6 (§15), Q7 (§16).
