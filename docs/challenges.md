# Challenges

> **Status:** 2026-11-12 · C1 is approved as the first challenge (Iteration 1). The others are candidates.

This document records the direction for challenge content ([design.md §9](design.md#9-challenge-content--decided-2026-11-12)), candidate challenges, and what SolutionValidator cannot check yet.

## Direction

- The developer AI writes the challenges. The first ones are simple.
- A challenge reads like a scenario question from an AWS certification exam: a short story ("A startup wants … They require …"), then the player designs the solution.
- Later challenges may resemble system design interview problems, where SolutionValidator can check them.
- Every requirement of a challenge maps to a SolutionValidator requirement. A challenge must not promise a check the library cannot make.

## What SolutionValidator can check (v0.13.0)

Requirement types:

| Type | Meaning |
|---|---|
| `reachable` | A matching target can be reached from a matching source through a chain of working intents (optionally for an action or port on the last hop). |
| `not-reachable` | No matching target is directly accessible from a matching source, whether or not an intent exists. |
| `uses` | The solution contains at least `min` components that match a selector. |
| `redundant` | Every matching component runs in more than one failure domain (managed by the provider or spread by the design). |

Selectors pick components by provided `id`, `type`, `category`, `trait` or a `role` the player assigns. The `aws` pack has API Gateway, Lambda, DynamoDB, S3, CloudFront (with origin access control), Application Load Balancer, EC2, Auto Scaling groups, RDS (with Multi-AZ), VPC, subnets, internet, NAT and egress-only gateways, route tables, security groups, network ACLs and gateway VPC endpoints. Check `node_modules/solution-validator/docs/formats.md` for the installed version before writing a challenge.

## Candidates

Each candidate must be verified against SolutionValidator before it is implemented: a reference solution passes and typical mistakes fail.

### C1. Serverless orders API

**Approved as the first challenge** ([design.md §11](design.md#11-first-challenge--decided-2026-11-12)).

*A small online shop wants customers to place orders through a public HTTPS API. The team does not want to manage servers. Orders must be stored durably, and the order data must not be accessible directly from the internet.*

- `reachable`: users (provided) → the order store (role), action `write`.
- `not-reachable`: users → any `data-store` directly.
- `uses`: at least one `compute` component without servers to manage (for example `aws.lambda`). How "without servers" is expressed needs checking: by type, or by a trait or role.

### C2. Static website with a private bucket

*A marketing team publishes a static website. Visitors around the world should load it quickly through a CDN. The storage bucket itself must not be publicly accessible.*

- `reachable`: users → the content bucket (role), action `read`, through the CDN.
- `not-reachable`: users → `aws.s3` directly.
- `uses`: `aws.cloudfront`.

### C3. Three-tier web application

*A company moves its web application to AWS. Visitors reach it through a load balancer; the application servers and the database must not be reachable from the internet.*

- `reachable`: users → the database (role) through the load balancer and the application tier.
- `not-reachable`: users → the application servers (role) and → the database (role) directly.
- `uses`: `aws.alb`.

### C4. Highly available web tier

*The company in C3 had an outage when one data center failed. The web tier and the database must survive the loss of one availability zone.*

- C3's requirements, plus `redundant` for the application tier (role) and the database (role).

### C5. Private servers that download updates (needs verification)

*Application servers in private subnets must download security updates from the internet, but nothing on the internet may open connections to them.*

- `not-reachable`: users → the servers. Verify how a `reachable` requirement towards the internet (outbound through a NAT gateway) is expressed and evaluated before using it.

### C6. Private access to object storage (needs verification)

*A function in a VPC writes reports to an S3 bucket. Security requires that this traffic does not go through the internet.*

- `reachable`: the function (role) → the reports bucket (role), action `write`, with a gateway VPC endpoint. Verify how "not through the internet" can be checked; if it cannot, the challenge needs a library change first.

## Gaps: topics SolutionValidator cannot check yet

These are common in exam questions and interviews. Challenges about them wait until the library supports them. When a planned challenge needs one of them, report it to SolutionValidator as an issue ([CLAUDE.md](../CLAUDE.md#reporting-to-solutionvalidator)) instead of checking it in the game, and list it in [validator-issues.md](validator-issues.md).

- Messaging and decoupling: queues and topics (SQS, SNS, EventBridge). The `core` pack has a `messaging` category, but the `aws` pack has no messaging types.
- Caching (ElastiCache, DAX), DNS and failover routing (Route 53), user authentication (Cognito), encryption and keys (KMS), secrets.
- Containers (ECS, EKS, Fargate), streaming (Kinesis), file storage (EFS).
- Backup and disaster recovery: RPO, RTO, cross-region replication.
- Comparative qualities that exam answers often hinge on: lowest cost, least operational overhead, lowest latency, highest throughput.
- Interview topics: load and scale estimates, throughput, sharding and partitioning, consistency models, rate limiting.
