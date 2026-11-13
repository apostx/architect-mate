import type { Verdict } from "solution-validator";
import type { Evaluation } from "../game/evaluate";
import { connectionLabel, type MessageContext, renderEvidence, roleLabel } from "../game/messages";
import { Icon } from "./icons";
import { VerdictBadge } from "./VerdictBadge";

interface ResultsDrawerProps {
  evaluation: Evaluation;
  /** The solution the evaluation was made for; labels come from it. */
  context: MessageContext;
  /** The design changed after the evaluation. */
  outdated: boolean;
  expanded: boolean;
  onToggle(): void;
  onSelectConnection(id: string): void;
}

const OVERALL: Record<Verdict, { text: string; icon: "check" | "cross" | "question" }> = {
  pass: { text: "Passed", icon: "check" },
  fail: { text: "Not passed", icon: "cross" },
  undecidable: { text: "Undecidable", icon: "question" },
};

/** The results of the latest evaluation, in a drawer below the canvas. */
export function ResultsDrawer({
  evaluation,
  context,
  outdated,
  expanded,
  onToggle,
  onSelectConnection,
}: ResultsDrawerProps) {
  const summary = summaryOf(evaluation);
  return (
    <section className={`results${expanded ? " expanded" : ""}`} aria-label="Results">
      <div className="results-bar">
        <span className={`results-overall ${summary.className}`}>
          <Icon name={summary.icon} size={18} strokeWidth={2.5} />
          {summary.text}
        </span>
        <span className="results-detail">{summary.detail}</span>
        {outdated && (
          <span className="results-outdated">
            You changed the design after this evaluation. Evaluate again to update the results.
          </span>
        )}
        <button
          type="button"
          className="secondary-button"
          aria-expanded={expanded}
          onClick={onToggle}
        >
          <Icon name={expanded ? "chevronDown" : "chevronUp"} size={16} strokeWidth={2.2} />
          {expanded ? "Hide details" : "Show details"}
        </button>
      </div>
      {expanded && (
        <div className={`results-body${outdated ? " outdated" : ""}`}>
          {evaluation.status === "incomplete" ? (
            <IncompleteDetails evaluation={evaluation} context={context} />
          ) : (
            <EvaluatedDetails
              evaluation={evaluation}
              context={context}
              onSelectConnection={onSelectConnection}
            />
          )}
        </div>
      )}
    </section>
  );
}

function summaryOf(evaluation: Evaluation) {
  if (evaluation.status === "incomplete") {
    return {
      text: "Not evaluated",
      icon: "question" as const,
      className: "verdict-incomplete",
      detail: "The solution is not complete yet.",
    };
  }
  const met = evaluation.requirements.filter((result) => result.verdict === "pass").length;
  const overall = OVERALL[evaluation.verdict];
  return {
    text: overall.text,
    icon: overall.icon,
    className: `verdict-${evaluation.verdict}`,
    detail: `${met} of ${evaluation.requirements.length} requirements met.`,
  };
}

function IncompleteDetails({
  evaluation,
  context,
}: {
  evaluation: Extract<Evaluation, { status: "incomplete" }>;
  context: MessageContext;
}) {
  return (
    <div className="results-column">
      <h3 className="panel-heading">What is missing</h3>
      <ul className="plain-list">
        {evaluation.unassignedRoles.map((role) => (
          <li key={role.id}>
            No component has the role <strong>{roleLabel(context, role.id)}</strong> yet. Select the
            component that is the {roleLabel(context, role.id).toLowerCase()} and tick the role.
          </li>
        ))}
        {evaluation.errors.map((finding, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: findings have no id
          <li key={index}>{finding.message}</li>
        ))}
      </ul>
    </div>
  );
}

function EvaluatedDetails({
  evaluation,
  context,
  onSelectConnection,
}: {
  evaluation: Extract<Evaluation, { status: "evaluated" }>;
  context: MessageContext;
  onSelectConnection(id: string): void;
}) {
  const requirements = context.challenge.task.requirements;
  return (
    <>
      <div className="results-column">
        <h3 className="panel-heading">Requirements</h3>
        <ul className="result-list">
          {evaluation.requirements.map((result) => {
            const requirement = requirements.find(
              (candidate) => candidate.id === result.requirement,
            );
            return (
              <li key={result.requirement} className="result-row">
                <VerdictBadge verdict={result.verdict} kind="requirement" />
                <div>
                  <p className="result-text">{requirement?.description ?? result.requirement}</p>
                  <ul className={`evidence-list${result.verdict === "pass" ? " muted" : ""}`}>
                    {result.evidence.map((evidence, index) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: evidence has no id
                      <li key={index}>{renderEvidence(context, evidence)}</li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="results-column">
        <h3 className="panel-heading">Connections</h3>
        {evaluation.intents.length === 0 && <p className="field-empty">No connections yet.</p>}
        <ul className="result-list">
          {evaluation.intents.map((result) => {
            const intent = context.solution.intents?.find(
              (candidate) => candidate.id === result.intent,
            );
            const purpose = [intent?.action, intent?.port].filter(Boolean).join(", ");
            const problems = result.checks.filter((check) => check.verdict !== "pass");
            return (
              <li key={result.intent} className="result-row">
                <VerdictBadge verdict={result.verdict} kind="connection" />
                <div>
                  <button
                    type="button"
                    className="link-button result-text"
                    onClick={() => onSelectConnection(result.intent)}
                  >
                    {connectionLabel(context, result.intent)}
                    {purpose && ` (${purpose})`}
                  </button>
                  {problems.length > 0 && (
                    <ul className="evidence-list">
                      {problems.flatMap((check) =>
                        check.evidence.map((evidence, index) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: evidence has no id
                          <li key={`${check.check}-${index}`}>
                            <span className="check-name">{CHECK_NAMES[check.check]}:</span>{" "}
                            {renderEvidence(context, evidence)}
                          </li>
                        )),
                      )}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

const CHECK_NAMES = {
  compatibility: "Compatibility",
  forwarding: "Forwarding",
  connectivity: "Network",
  authorization: "Permission",
} as const;
