import { describe, expect, it } from "vitest";
import { loadChallenges } from "../src/challenges/index";
import { evaluate } from "../src/game/evaluate";
import { renderEvidence } from "../src/game/messages";
import {
  addComponent,
  addConnection,
  connectionOptions,
  initialSolution,
  lockedIds,
  portFor,
  removeComponent,
  removeConnection,
  setConnectionAction,
  setLabel,
  setProperty,
  setRole,
} from "../src/game/solution";
import { createGameRegistry } from "../src/validation/registry";

const registry = createGameRegistry();
const [challenge] = loadChallenges(registry);
if (!challenge) throw new Error("No challenge");

/** Builds the reference design of C1 through the editing operations, as a player would. */
function buildReference() {
  let solution = initialSolution(challenge as NonNullable<typeof challenge>);
  const api = addComponent(solution, registry, "aws.api-gateway", { x: 200, y: 160 });
  solution = api.solution;
  const fn = addComponent(solution, registry, "aws.lambda", { x: 400, y: 160 });
  solution = fn.solution;
  const table = addComponent(solution, registry, "aws.dynamodb", { x: 600, y: 160 });
  solution = table.solution;
  solution = setRole(solution, table.id, "order-store", true);
  solution = setProperty(solution, api.id, "routes", [{ path: "/orders", target: fn.id }]);
  solution = setProperty(solution, fn.id, "permissions", [{ resource: table.id, access: "write" }]);
  solution = addConnection(solution, registry, "customers", api.id, "invoke").solution;
  solution = addConnection(solution, registry, api.id, fn.id, "invoke").solution;
  const write = addConnection(solution, registry, fn.id, table.id, "write");
  return { solution: write.solution, api: api.id, fn: fn.id, table: table.id, write: write.id };
}

describe("editing a solution", () => {
  it("starts with the provided components at their positions", () => {
    const solution = initialSolution(challenge);
    expect(solution.components).toEqual([
      {
        id: "customers",
        type: "core.internet",
        label: "Customers",
        meta: { position: { x: 0, y: 160 } },
      },
    ]);
    expect(lockedIds(challenge)).toEqual(new Set(["customers"]));
  });

  it("names new components after their type", () => {
    const first = addComponent(initialSolution(challenge), registry, "aws.lambda", {
      x: 1.4,
      y: 2.6,
    });
    const second = addComponent(first.solution, registry, "aws.lambda", { x: 0, y: 0 });
    expect(first.id).toBe("lambda-function-1");
    expect(second.id).toBe("lambda-function-2");
    expect(second.solution.components.at(-1)?.label).toBe("Lambda function 2");
    expect(first.solution.components.at(-1)?.meta).toEqual({ position: { x: 1, y: 3 } });
  });

  it("offers the actions the target accepts and sets the port they imply", () => {
    expect(connectionOptions(registry, "aws.api-gateway").actions).toEqual(["invoke"]);
    expect(connectionOptions(registry, "aws.dynamodb").actions).toEqual(["read", "write"]);
    expect(connectionOptions(registry, "aws.s3").actions).toEqual(["read", "write"]);
    expect(portFor(registry, "aws.api-gateway", "invoke")).toBe("https");
    expect(portFor(registry, "aws.lambda", "invoke")).toBeUndefined();
  });

  it("builds C1's reference design, which passes", () => {
    const { solution } = buildReference();
    expect(solution.intents?.[0]).toEqual({
      id: "customers-to-api-gateway-1",
      from: "customers",
      to: "api-gateway-1",
      action: "invoke",
      port: "https",
    });
    const evaluation = evaluate(challenge, solution, registry);
    expect(evaluation.status).toBe("evaluated");
    if (evaluation.status === "evaluated") expect(evaluation.verdict).toBe("pass");
  });

  it("does not add the same connection twice", () => {
    const { solution, fn, table, write } = buildReference();
    const again = addConnection(solution, registry, fn, table, "write");
    expect(again.id).toBe(write);
    expect(again.solution).toBe(solution);
  });

  it("changes a connection's action", () => {
    const { solution, write } = buildReference();
    const read = setConnectionAction(solution, registry, write, "read");
    expect(read.intents?.find((intent) => intent.id === write)?.action).toBe("read");
    const evaluation = evaluate(challenge, read, registry);
    if (evaluation.status !== "evaluated") throw new Error("Not evaluated");
    expect(evaluation.verdict).toBe("fail");
  });

  it("removes a component with its connections and the references to it", () => {
    const { solution, fn, table } = buildReference();
    const next = removeComponent(solution, registry, table, lockedIds(challenge));
    expect(next.components.map((component) => component.id)).not.toContain(table);
    expect(next.intents?.some((intent) => intent.to === table)).toBe(false);
    expect(next.components.find((component) => component.id === fn)?.properties).toEqual({
      permissions: [],
    });
    // The solution stays valid: the only thing missing is the role.
    const evaluation = evaluate(challenge, next, registry);
    expect(evaluation).toMatchObject({ status: "incomplete", errors: [] });
  });

  it("keeps locked components", () => {
    const solution = initialSolution(challenge);
    expect(removeComponent(solution, registry, "customers", lockedIds(challenge))).toBe(solution);
  });

  it("edits labels, roles, properties and connections", () => {
    const { solution, fn, table, write } = buildReference();
    let next = setLabel(solution, fn, "Place order");
    expect(next.components.find((component) => component.id === fn)?.label).toBe("Place order");
    next = setLabel(next, fn, " ");
    expect(next.components.find((component) => component.id === fn)?.label).toBeUndefined();
    next = setRole(next, table, "order-store", false);
    expect(next.components.find((component) => component.id === table)?.roles).toBeUndefined();
    next = setProperty(next, fn, "permissions", undefined);
    expect(next.components.find((component) => component.id === fn)?.properties).toBeUndefined();
    next = removeConnection(next, write);
    expect(next.intents?.some((intent) => intent.id === write)).toBe(false);
  });
});

describe("evidence messages", () => {
  it("uses the player's labels and the game's wording", () => {
    const { solution, fn } = buildReference();
    const named = setProperty(setLabel(solution, fn, "Place order"), fn, "permissions", undefined);
    const evaluation = evaluate(challenge, named, registry);
    if (evaluation.status !== "evaluated") throw new Error("Not evaluated");
    const context = { registry, challenge, solution: named };
    const place = evaluation.requirements.find((result) => result.requirement === "place-orders");
    expect(place?.evidence.map((evidence) => renderEvidence(context, evidence))).toEqual([
      "No chain of working connections leads from Customers to the order store (write).",
    ]);
    const failing = evaluation.intents.find((intent) => intent.verdict === "fail");
    const authorization = failing?.checks.find((check) => check.check === "authorization");
    expect(authorization?.evidence.map((evidence) => renderEvidence(context, evidence))).toEqual([
      "Place order does not set permissions; the default, [], applies.",
      "Place order has no permission on DynamoDB table 1 that allows write.",
    ]);
  });

  it("renders paths and types with labels", () => {
    const { solution } = buildReference();
    const evaluation = evaluate(challenge, solution, registry);
    if (evaluation.status !== "evaluated") throw new Error("Not evaluated");
    const context = { registry, challenge, solution };
    const texts = evaluation.requirements.flatMap((result) =>
      result.evidence.map((evidence) => renderEvidence(context, evidence)),
    );
    expect(texts).toEqual([
      "Works: Customers → API Gateway 1 → Lambda function 1 → DynamoDB table 1.",
      "Works: Customers → API Gateway 1.",
      "Not directly accessible (2 combinations checked).",
      "1 component(s) match a Lambda function; at least 1 required.",
    ]);
  });
});
