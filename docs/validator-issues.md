# SolutionValidator issues

Issues that ArchitectMate reported to [SolutionValidator](https://github.com/apostx/solution-validator/issues), following [CLAUDE.md](../CLAUDE.md#reporting-to-solutionvalidator). Update the status when an issue is resolved or the library version that fixes it is adopted.

| Issue | Summary | Blocks | Workaround | Status |
|---|---|---|---|---|
| [#29](https://github.com/apostx/solution-validator/issues/29) | Released versions cannot be installed: not on npm, and Git installs lack `dist/` | Nothing | Install the tag's source tarball and compile from source ([design.md §3](design.md#3-solutionvalidator-dependency--decided-2026-11-12)) | Open |
| [#30](https://github.com/apostx/solution-validator/issues/30) | Requirements cannot forbid components: `uses` has no maximum | "No servers to manage" or "do not use X" requirements | None | Open |
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

## Drafts not filed

Issues a session could not file itself. The product owner files them, then they move to the table above.

(none)
