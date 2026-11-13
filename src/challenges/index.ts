import type { Registry } from "solution-validator";
import { type Challenge, parseChallenge } from "./challenge";
import serverlessOrdersApi from "./serverless-orders-api.json";

/** The challenge files that ship with the game, in play order. */
export const CHALLENGE_FILES: readonly unknown[] = [serverlessOrdersApi];

/**
 * Parses the bundled challenges. They are validated in tests, so an invalid one is a programming
 * error and throws.
 */
export function loadChallenges(registry: Registry): Challenge[] {
  return CHALLENGE_FILES.map((file, index) => {
    const parsed = parseChallenge(file, registry);
    if (!parsed.ok) {
      const problems = [...parsed.errors, ...parsed.taskFindings.map((f) => f.message)];
      throw new Error(`Challenge ${index} is invalid: ${problems.join(" ")}`);
    }
    return parsed.challenge;
  });
}
