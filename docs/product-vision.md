# ArchitectMate

**Product intent and usage expectations**

> This is **not** a technical specification, UI design, or complete backlog. It records the intentions discussed so far. Unspecified behavior must not be invented or implemented without the owner's approval.

## Purpose

ArchitectMate is a minimalist, visual **system design and solution architecture practice game**. The player is given requirements for a system and designs a solution by choosing components, connecting them and setting properties relevant to the task.

The purpose is to practise understanding **what components do, how they interact, and whether the complete solution satisfies the requirements**, rather than memorizing one example architecture or reproducing a predefined diagram.

The initial focus is **AWS**, mainly to keep the scope manageable. The longer-term direction may include Azure, on-premises and hybrid solutions.

## Intended experience

- The player receives a task, for example designing a web shop, with requirements and possible constraints.
- The player assembles an architecture visually. They should understand the system and its relationships without having to configure every technical detail.
- Relevant logical settings matter, including, where the task requires them, network placement, security groups, access restrictions, permissions and redundancy.
- The solution is evaluated **by its behavior and compliance with the requirements**, not by visual similarity to a model answer.
- **Several different architectures can be correct.** A task may also make a particular capability, approach or service more suitable or explicitly mandatory.
- The player receives evaluation results and, when the scoring rules are agreed, a score in the spirit of system-design challenges on coding practice platforms.

A drawn connection alone must not be treated as proof that two components can actually communicate. The player's design and the configured behavior should determine that.

The interface should be **clean, minimal and visually understandable**, with the overall architecture visible and relevant details accessible. Exact IP addresses or full infrastructure configuration should **not** be mandatory for ordinary conceptual challenges. The exact UI, navigation and interaction design are still open.

**No AI is required in the finished product** for validation, scoring or explanations.

## Using SolutionValidator

ArchitectMate is a **separate application and a consumer of** [SolutionValidator](https://github.com/apostx/solution-validator). The library must remain independent of the game and its UI.

- **SolutionValidator** is responsible for the solution model, component definitions, analysis of relationships and supported operating behavior, and requirement verdicts. Its results distinguish `pass`, `fail` and `undecidable`, with findings and evidence.
- **ArchitectMate** is responsible for the player experience, displaying tasks, editing a solution visually, presenting results, and **game-specific scoring** once its rules are approved.
- ArchitectMate should **reuse the library's own model, packs and validation**, not create a competing data model or duplicate validation logic inside the UI.
- The game should not silently reinterpret `undecidable` as `fail`, or claim that something has been verified when the library cannot establish it.

The library currently provides solution parsing, analysis, requirement checking and facts queries. It **does not calculate scores**. Its current requirement types are `reachable`, `not-reachable`, `uses` and `redundant`. The game's initial challenges should be based on what the library can actually check. If a new challenge needs unsupported validation, the gap should be raised before implementing it.

The existing [SolutionValidator demo](https://apostx.github.io/solution-validator/) illustrates how the library can be used visually. It is **not** an approved feature list or UI specification for ArchitectMate. The developer should inspect the [README](https://github.com/apostx/solution-validator/blob/main/README.md), [formats](https://github.com/apostx/solution-validator/blob/main/docs/formats.md) and [current public API](https://github.com/apostx/solution-validator/blob/main/src/index.ts) rather than assume interfaces described here. Availability of a separately installable package must be verified before integration.

## Existing UI experience to consider: Domain Map

The existing [Domain Map project](https://github.com/apostx/domain-map) and its [guided demo](https://apostx.github.io/domain-map-guided-demo/) already contain UI approaches and libraries that have been used and tested in practice. ArchitectMate development should **review these existing solutions before choosing or implementing similar UI functionality**, especially where the two applications have comparable diagram and navigation needs.

- Reuse proven libraries, interaction patterns or implementation ideas **where they genuinely fit ArchitectMate**. Avoid recreating existing solutions without a reason.
- This is **an opportunity to reuse experience, not a requirement to copy Domain Map's interface or architecture**. ArchitectMate has its own goals and user experience.
- The developer AI should inspect what Domain Map actually uses and how well it applies; it should not assume a specific library, UI pattern or feature is mandatory without checking and discussing it first.

## Scope boundaries and future direction

The game should concentrate on component roles, connections, relevant configurations, and task requirements. The library's more detailed analysis remains optional and should not make the basic learning experience complicated.

Broader provider support and more detailed exercises are possible later. A free-design or sandbox mode could also make sense, but **it has not been agreed as a first-release requirement**.

Terraform is **not** the internal data format of the game. The library's existing optional Terraform export does not create a requirement to expose Terraform features in ArchitectMate.

Accounts, leaderboards, progression, timed challenges, persistence and other game mechanics **have not been discussed as requirements**. Do not add them automatically.

## Instructions for the developer AI

1. Treat this document as **product intent, not permission to invent behavior**.
2. Inspect SolutionValidator's actual capabilities before proposing tasks or integration details. Do not duplicate its validation logic.
3. Ask before deciding substantial unspecified behavior, especially scoring, evaluation timing, challenge structure, UI flow, persistence and additional modes.
4. If the library cannot evaluate something the game is expected to check, explain the gap rather than faking a result or silently adding a new validator.
5. Keep **suggestions clearly separate from agreed requirements**. Explain why each is important and obtain approval before implementing it.
6. Do not derive a technical stack, full product roadmap or detailed UI specification from this document alone.

## Open questions — not pre-approved features

- What should the **first playable task** be, using the checks already supported by SolutionValidator?
- How should **points**, success criteria and `undecidable` results be handled?
- Which editing interactions and logical properties should the first version expose?
- Should evaluation run continuously or only when the player requests it?
- Is a separate sandbox mode wanted later?

Decide these with the owner when needed. Do not assume answers.
