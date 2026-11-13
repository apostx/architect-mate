import type { Verdict } from "solution-validator";

const TEXT = {
  requirement: { pass: "Pass", fail: "Fail", undecidable: "Undecidable" },
  connection: { pass: "Works", fail: "Fails", undecidable: "Undecidable" },
} as const;

/** A verdict as a labelled badge. `undecidable` keeps its own look; it is never a pass or fail. */
export function VerdictBadge({
  verdict,
  kind,
}: {
  verdict: Verdict;
  kind: "requirement" | "connection";
}) {
  return <span className={`verdict-badge verdict-${verdict}`}>{TEXT[kind][verdict]}</span>;
}
