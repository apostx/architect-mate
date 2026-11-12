import { readFileSync } from "node:fs";
import { analyze, checkRequirements, parseSolution, parseTask } from "solution-validator";
import { describe, expect, it } from "vitest";
import { createGameRegistry } from "../src/validation/registry";

function readFixture(name: string): unknown {
  return JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8"));
}

/** Checks a solution against a task with SolutionValidator, the way the game will. */
function check(solution: unknown, task: unknown) {
  const registry = createGameRegistry();
  const parsedSolution = parseSolution(solution, registry);
  const parsedTask = parseTask(task, registry);
  if (!parsedSolution.ok) throw new Error(JSON.stringify(parsedSolution.findings));
  if (!parsedTask.ok) throw new Error(JSON.stringify(parsedTask.findings));
  return checkRequirements(parsedSolution.model, analyze(parsedSolution.model), parsedTask.task);
}

function verdicts(result: ReturnType<typeof check>): Record<string, string> {
  return Object.fromEntries(result.requirements.map((r) => [r.requirement, r.verdict]));
}

describe("SolutionValidator integration", () => {
  const task = readFixture("serverless-orders.task.json");
  const solution = readFixture("serverless-orders.solution.json") as {
    components: { id: string; properties?: Record<string, unknown> }[];
  };

  it("loads the core and aws packs", () => {
    expect(createGameRegistry().packs.map((pack) => pack.id)).toEqual(["aws", "core"]);
  });

  it("passes a solution that meets every requirement", () => {
    const result = check(solution, task);
    expect(verdicts(result)).toEqual({ r1: "pass", r2: "pass", r3: "pass" });
    expect(result.verdict).toBe("pass");
  });

  it("fails a solution with a public bucket", () => {
    const publicBucket = structuredClone(solution);
    const uploads = publicBucket.components.find((component) => component.id === "uploads");
    if (!uploads) throw new Error("Fixture has no uploads bucket");
    uploads.properties = { publicAccess: true };

    const result = check(publicBucket, task);
    expect(verdicts(result).r2).toBe("fail");
    expect(result.verdict).toBe("fail");
  });
});
