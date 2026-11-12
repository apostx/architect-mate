import {
  type AnalysisResult,
  analyze,
  checkRequirements,
  type Finding,
  type IntentVerdict,
  parseSolution,
  type Registry,
  type RequirementResult,
  type RoleDefinition,
  type Verdict,
} from "solution-validator";
import type { Challenge } from "../challenges/challenge";

/**
 * The outcome of evaluating a solution against a challenge. Every verdict comes from
 * SolutionValidator; the game only decides whether the solution is complete enough to show them.
 */
export type Evaluation =
  | {
      /** The solution is not complete yet, so it is not evaluated (design.md §12). */
      readonly status: "incomplete";
      /** Roles of the task that no component has yet. */
      readonly unassignedRoles: readonly RoleDefinition[];
      /** Errors in the solution that the library reports, such as an unknown reference. */
      readonly errors: readonly Finding[];
    }
  | {
      readonly status: "evaluated";
      /** The task's overall verdict. */
      readonly verdict: Verdict;
      /** One result per requirement, in the task's order. */
      readonly requirements: readonly RequirementResult[];
      /** The access verdict of every connection, sorted by id. */
      readonly intents: readonly IntentVerdict[];
      readonly analysis: AnalysisResult;
    };

/**
 * Evaluates a solution (in SolutionValidator's solution format) against a challenge, with the
 * challenge's analysis options.
 */
export function evaluate(challenge: Challenge, solution: unknown, registry: Registry): Evaluation {
  const parsed = parseSolution(solution, registry);
  if (!parsed.ok) return { status: "incomplete", unassignedRoles: [], errors: parsed.findings };

  const analysis = analyze(parsed.model, challenge.analysis);
  const errors = analysis.analyses
    .filter((report) => report.id === "model-validity")
    .flatMap((report) => report.findings)
    .filter((finding) => finding.severity === "error");
  const result = checkRequirements(parsed.model, analysis, challenge.task);
  const unassigned = new Set(
    result.findings
      .filter((finding) => finding.code === "TASK_ROLE_UNASSIGNED")
      .map((finding) => String(finding.params.role)),
  );
  if (errors.length > 0 || unassigned.size > 0) {
    return {
      status: "incomplete",
      unassignedRoles: (challenge.task.roles ?? []).filter((role) => unassigned.has(role.id)),
      errors,
    };
  }

  const access = analysis.analyses.find((report) => report.id === "access");
  return {
    status: "evaluated",
    verdict: result.verdict,
    requirements: result.requirements,
    intents: access?.id === "access" ? access.intents : [],
    analysis,
  };
}
