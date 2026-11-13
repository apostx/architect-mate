import { useMemo } from "react";
import { VERSION as VALIDATOR_VERSION } from "solution-validator";
import { loadChallenges } from "./challenges/index";
import { ChallengeScreen } from "./ui/ChallengeScreen";
import { createGameRegistry } from "./validation/registry";

const SOURCE_URL = "https://github.com/apostx/architect-mate";

/** The game: the first challenge, with the versions and the source link below it. */
export function App() {
  const registry = useMemo(() => createGameRegistry(), []);
  const challenges = useMemo(() => loadChallenges(registry), [registry]);
  const challenge = challenges[0];

  return (
    <div className="page">
      {challenge ? (
        <ChallengeScreen challenge={challenge} registry={registry} />
      ) : (
        <p className="status">No challenge is available.</p>
      )}
      <footer className="footer">
        <span>ArchitectMate {__APP_VERSION__}</span>
        <span>SolutionValidator {VALIDATOR_VERSION}</span>
        <span>Packs: {registry.packs.map((pack) => `${pack.id} ${pack.version}`).join(", ")}</span>
        <a href={SOURCE_URL}>Source code (AGPL-3.0)</a>
      </footer>
    </div>
  );
}
