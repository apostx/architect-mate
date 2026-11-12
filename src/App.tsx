import { useMemo } from "react";
import { VERSION as VALIDATOR_VERSION } from "solution-validator";
import { createGameRegistry } from "./validation/registry";

const SOURCE_URL = "https://github.com/apostx/architect-mate";

/** Placeholder shell for Iteration 0. The game UI is designed in later iterations. */
export function App() {
  const packs = useMemo(() => createGameRegistry().packs, []);

  return (
    <main className="shell">
      <h1>ArchitectMate</h1>
      <p className="tagline">A visual system design and solution architecture practice game.</p>
      <p className="status">Under construction. The first playable challenge is coming soon.</p>
      <footer className="footer">
        <span>ArchitectMate {__APP_VERSION__}</span>
        <span>SolutionValidator {VALIDATOR_VERSION}</span>
        <span>Packs: {packs.map((pack) => `${pack.id} ${pack.version}`).join(", ")}</span>
        <a href={SOURCE_URL}>Source code (AGPL-3.0)</a>
      </footer>
    </main>
  );
}
