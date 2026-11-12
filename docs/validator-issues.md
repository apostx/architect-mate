# SolutionValidator issues

Issues that ArchitectMate reported to [SolutionValidator](https://github.com/apostx/solution-validator/issues), following [CLAUDE.md](../CLAUDE.md#reporting-to-solutionvalidator). Update the status when an issue is resolved or the library version that fixes it is adopted.

| Issue | Summary | Blocks | Workaround | Status |
|---|---|---|---|---|
| [#29](https://github.com/apostx/solution-validator/issues/29) | Released versions cannot be installed: not on npm, and Git installs lack `dist/` | Nothing | Install the tag's source tarball and compile from source ([design.md §3](design.md#3-solutionvalidator-dependency--decided-2026-11-12)) | Open |
| [#30](https://github.com/apostx/solution-validator/issues/30) | Requirements cannot forbid components: `uses` has no maximum | "No servers to manage" or "do not use X" requirements | C1 offers no server types in its palette, so "no servers" holds by construction; the game does not claim it was checked ([challenge-format.md](challenge-format.md#rules-for-challenge-content)) | Open |
| [#31](https://github.com/apostx/solution-validator/issues/31) | Requirements cannot require a path through a component (`via`) | Decoupling, caching and "only through the CDN" requirements | Partly: `not-reachable` for the direct path | Open |
| [#32](https://github.com/apostx/solution-validator/issues/32) | `aws` pack: messaging types (SQS, SNS, EventBridge) | Decoupling and fan-out challenges | None | Open |
| [#33](https://github.com/apostx/solution-validator/issues/33) | `aws` pack: caching types (ElastiCache, DAX) | Caching challenges | None | Open |
| [#34](https://github.com/apostx/solution-validator/issues/34) | DNS routing and failover (Route 53) | DNS and failover challenges | None | Open |
| [#35](https://github.com/apostx/solution-validator/issues/35) | Authenticated callers: identity providers and authorizers (Cognito) | "Only signed-in users" challenges | None | Open |
| [#36](https://github.com/apostx/solution-validator/issues/36) | Configuration requirements: encryption and secrets (KMS, Secrets Manager) | Encryption and secrets challenges | None | Open |
| [#37](https://github.com/apostx/solution-validator/issues/37) | `aws` pack: containers, streaming and file storage (ECS, EKS, Kinesis, EFS) | Challenges with these services | None | Open |
| [#38](https://github.com/apostx/solution-validator/issues/38) | Disaster recovery: regions, cross-region replication, backups, RPO and RTO | Disaster recovery challenges | None | Open |
| [#39](https://github.com/apostx/solution-validator/issues/39) | Comparative qualities: cost, operational overhead and latency | "Most cost-effective" or "least overhead" challenges | None; may be declined as out of scope | Open |
| [#40](https://github.com/apostx/solution-validator/issues/40) | Capacity and data distribution for system design interview problems | Interview-style challenges | None; may be declined as out of scope | Open |
| [#41](https://github.com/apostx/solution-validator/issues/41) | `not-reachable`: a `role` selector combined with other fields reports `ROLE_UNASSIGNED` although the role is assigned (bug) | Selectors that combine a role with a type or category | Challenges select roles without other fields | Open |
| [#42](https://github.com/apostx/solution-validator/issues/42) | Authorization evidence for a forwarder without a route to the target only says `NOT_PRINCIPAL` (bug) | A clear explanation of C1's "API without a route" mistake | The `forwarding` check's `ROUTE_MISSING` is shown next to it | Open |
| [#43](https://github.com/apostx/solution-validator/issues/43) | `reachable` with `port`: an intent without a port does not count, although its checks pass and the target listens only on that port | Nothing | The editor always sets the port when the target's accepted interactions name one | Open |
| [#44](https://github.com/apostx/solution-validator/issues/44) | `aws` pack: API Gateway AWS service integrations (DynamoDB, S3) are not accepted | "Least operational overhead" challenges; a correct explanation when a C1 player routes API Gateway straight to DynamoDB | C1 requires Lambda, so its verdict is right | Open |
| [#45](https://github.com/apostx/solution-validator/issues/45) | Path evidence has only a preformatted string, so consumers cannot show component labels | Paths shown with the player's labels | The game shows the library's path text, with readable component ids | Open |

## Drafts not filed

Issues a session could not file itself. The product owner files them, then they move to the table above.

(none)
