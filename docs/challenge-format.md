# Challenge format

> **Status:** Implemented in Iteration 1 (format version 1). Delegated to the developer AI ([design.md §15](design.md#15-challenge-file-format--decided-2026-11-12-delegated)); the product owner may ask for changes.

A challenge is one JSON file in `src/challenges/`, listed in `src/challenges/index.ts`. It contains a SolutionValidator task, which the library validates unchanged with `parseTask`, and the game-only content next to it. The game does not repeat what the task already says: the title, the provided components, the roles and the requirements come from the task.

```json
{
  "formatVersion": 1,
  "difficulty": "introductory",
  "scenario": ["A small online shop wants …", "How would you design it?"],
  "analysis": { "assumptions": "pack-defaults" },
  "palette": [
    { "type": "aws.api-gateway", "properties": ["endpoint", "routes"] },
    { "type": "aws.dynamodb", "properties": [] }
  ],
  "task": { "schemaVersion": 1, "id": "serverless-orders-api", "title": "Serverless orders API", … }
}
```

| Field | Meaning |
|---|---|
| `formatVersion` | Always `1`. |
| `difficulty` | A short label shown with the challenge, such as `introductory`. It has no other effect. |
| `scenario` | The story, one paragraph per entry, in the style of an AWS certification exam question. |
| `analysis` | The options of SolutionValidator's `analyze` for every evaluation: `level` (`logical` or `detailed`) and `assumptions` (`strict` or `pack-defaults`). Challenges use `pack-defaults`, so that settings the player does not touch take the pack's documented defaults, and the challenge stays decidable ([design.md §12](design.md#12-scoring-and-decidability--decided-2026-11-12)). |
| `palette` | The component types the player may add, in display order, and for each type the properties the player may edit. Every type and property must exist in the loaded packs, and the type's pack must be one the task uses. Other properties stay unset (the pack default applies under `pack-defaults`). |
| `task` | A SolutionValidator task ([formats.md](../node_modules/solution-validator/docs/formats.md#task) of the installed version). Its `id` is the challenge id and its `title` the challenge title. Requirements need a `description`: it is the text the player reads. |

Game data inside the task and the solution uses the library's free-form `meta`, which the library returns unchanged and never interprets:

- `task.provided[].meta.position` (required): `{ x, y }`, where the provided component starts on the canvas.
- In the player's solution, `components[].meta.position` keeps where each component is on the canvas. The editor's state is a SolutionValidator solution; there is no separate game model.

## Rules for challenge content

- Every requirement maps to a SolutionValidator requirement; the requirement's `description` says only what the library checks.
- What the palette leaves out cannot be used. A challenge may use this to keep the design space small, but it must not claim that the library checked it. For example, C1 offers no servers, which makes "no servers to manage" true by construction; the library cannot forbid components yet ([solution-validator#30](https://github.com/apostx/solution-validator/issues/30)).
- The challenge must be decidable: for a complete solution every requirement is `pass` or `fail`.

## Fixtures and tests

Every challenge has fixture solutions in `test/fixtures/challenges/<challenge id>/*.solution.json`. Each is a SolutionValidator solution whose `meta` holds a `note` (what the solution shows) and `expected`:

```json
"meta": {
  "note": "The function has no permission on the table, so it cannot write the orders.",
  "expected": { "status": "evaluated", "verdict": "fail", "requirements": { "place-orders": "fail", "https-api": "pass", "private-orders": "pass", "uses-lambda": "pass" } }
}
```

`status` is `evaluated` or `incomplete` (with `unassignedRoles`). `test/challenges.test.ts` validates every challenge file, evaluates every fixture through the same `evaluate` function the game uses, and checks the result, including that no requirement and no connection is `undecidable`. Each challenge needs at least one passing and one failing fixture; add one fixture per typical mistake, and one per alternative correct design.

## Evaluation

`src/game/evaluate.ts` parses the solution, runs `analyze` with the challenge's `analysis` options and `checkRequirements` with the task. Before showing verdicts it checks, from the library's own findings, whether the solution is complete:

- a role of the task that no component has (`TASK_ROLE_UNASSIGNED`);
- errors in the solution (`model-validity` findings with severity `error`, or schema findings).

An incomplete solution is not evaluated: the game says what is missing instead (design.md §12). Otherwise the game shows the task's verdict, each requirement's verdict and evidence, and the access verdict of every connection.
