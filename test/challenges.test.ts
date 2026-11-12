import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseChallenge } from "../src/challenges/challenge";
import { CHALLENGE_FILES, loadChallenges } from "../src/challenges/index";
import { evaluate } from "../src/game/evaluate";
import { createGameRegistry } from "../src/validation/registry";

const registry = createGameRegistry();

/** What a fixture solution expects, kept in its `meta.expected`. */
interface Expected {
  status: "evaluated" | "incomplete";
  verdict?: "pass" | "fail";
  requirements?: Record<string, "pass" | "fail">;
  unassignedRoles?: string[];
}

interface Fixture {
  name: string;
  solution: { meta: { note: string; expected: Expected } };
}

function readFixtures(challengeId: string): Fixture[] {
  const dir = new URL(`./fixtures/challenges/${challengeId}/`, import.meta.url);
  return readdirSync(dir)
    .filter((file) => file.endsWith(".solution.json"))
    .sort()
    .map((file) => ({
      name: file.replace(".solution.json", ""),
      solution: JSON.parse(readFileSync(new URL(file, dir), "utf8")),
    }));
}

describe("challenge files", () => {
  it.each(CHALLENGE_FILES.map((file, index) => [index, file] as const))(
    "challenge %i is valid",
    (_index, file) => {
      const parsed = parseChallenge(file, registry);
      expect(parsed.ok ? [] : [...parsed.errors, ...parsed.taskFindings]).toEqual([]);
    },
  );

  it("rejects unknown fields, types and properties", () => {
    const [file] = CHALLENGE_FILES as Record<string, unknown>[];
    const parsed = parseChallenge(
      {
        ...file,
        extra: true,
        analysis: { assumptions: "optimistic" },
        palette: [{ type: "aws.lambda", properties: ["memory"] }, { type: "aws.nope" }],
      },
      registry,
    );
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.errors).toEqual([
        "extra is not a challenge field.",
        "analysis.assumptions must be strict or pack-defaults.",
        "palette[0].properties: memory is not a property of aws.lambda.",
        "palette[1] must have a type and a properties array.",
      ]);
    }
  });

  it("passes the task to the library unchanged", () => {
    const [file] = CHALLENGE_FILES as { task: unknown }[];
    const [challenge] = loadChallenges(registry);
    expect(challenge?.task).toEqual(file?.task);
  });
});

describe.each(loadChallenges(registry).map((challenge) => [challenge.id, challenge] as const))(
  "challenge %s",
  (id, challenge) => {
    const fixtures = readFixtures(id);

    it("has a passing reference solution and failing solutions", () => {
      const outcomes = fixtures.map(({ solution }) => solution.meta.expected.verdict);
      expect(outcomes).toContain("pass");
      expect(outcomes).toContain("fail");
    });

    it.each(fixtures.map((fixture) => [fixture.name, fixture] as const))(
      "%s",
      (_name, { solution }) => {
        const expected = solution.meta.expected;
        const evaluation = evaluate(challenge, solution, registry);
        expect(evaluation.status).toBe(expected.status);

        if (evaluation.status === "incomplete") {
          expect(evaluation.errors).toEqual([]);
          expect(evaluation.unassignedRoles.map((role) => role.id)).toEqual(
            expected.unassignedRoles,
          );
          return;
        }
        // Challenges are always decidable (design.md §12): no requirement may be undecidable.
        const verdicts = Object.fromEntries(
          evaluation.requirements.map((result) => [result.requirement, result.verdict]),
        );
        expect(verdicts).toEqual(expected.requirements);
        expect(evaluation.verdict).toBe(expected.verdict);
        // Every connection is decided too, so the player sees why each one works or not.
        expect(evaluation.intents.filter((intent) => intent.verdict === "undecidable")).toEqual([]);
      },
    );
  },
);
