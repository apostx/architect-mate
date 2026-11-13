import type { IntentVerdict, Registry, Solution } from "solution-validator";
import type { Challenge } from "../challenges/challenge";
import { componentLabel, type MessageContext, renderEvidence } from "../game/messages";
import {
  connectionOptions,
  setConnectionAction,
  setLabel,
  setProperty,
  setRole,
} from "../game/solution";
import type { Selection } from "./Canvas";
import { Icon, TypeIcon } from "./icons";
import { PropertyEditor } from "./PropertyEditor";
import { VerdictBadge } from "./VerdictBadge";

interface InspectorProps {
  challenge: Challenge;
  registry: Registry;
  solution: Solution;
  locked: ReadonlySet<string>;
  selection: NonNullable<Selection>;
  /** The connection's result from the latest evaluation, while it is up to date. */
  intentResult: IntentVerdict | undefined;
  onChange(solution: Solution): void;
  onRemove(selection: NonNullable<Selection>): void;
  onClose(): void;
}

/** The selected component's or connection's settings, in a panel over the canvas. */
export function Inspector(props: InspectorProps) {
  return (
    <section className="inspector floating-panel" aria-label="Selection">
      {props.selection.kind === "component" ? (
        <ComponentInspector {...props} id={props.selection.id} />
      ) : (
        <ConnectionInspector {...props} id={props.selection.id} />
      )}
    </section>
  );
}

function CloseButton({ onClose }: { onClose(): void }) {
  return (
    <button type="button" className="icon-button" aria-label="Close" onClick={onClose}>
      <Icon name="cross" size={16} strokeWidth={2} />
    </button>
  );
}

function ComponentInspector({
  challenge,
  registry,
  solution,
  locked,
  id,
  onChange,
  onRemove,
  onClose,
}: InspectorProps & { id: string }) {
  const component = solution.components.find((candidate) => candidate.id === id);
  if (!component) return null;
  const type = registry.getType(component.type);
  const isLocked = locked.has(id);
  const entry = challenge.palette.find((candidate) => candidate.type === component.type);
  // Components this one connects to come first, so a new route or permission points at one.
  const targets = new Set(
    (solution.intents ?? []).filter((intent) => intent.from === id).map((intent) => intent.to),
  );
  const rank = (candidate: (typeof solution.components)[number]) =>
    targets.has(candidate.id)
      ? 0
      : registry.getType(candidate.type)?.category === "external"
        ? 2
        : 1;
  const others = solution.components
    .filter((candidate) => candidate.id !== id)
    .map((candidate, index) => ({ candidate, index }))
    .sort((a, b) => rank(a.candidate) - rank(b.candidate) || a.index - b.index)
    .map(({ candidate }) => ({ id: candidate.id, label: candidate.label ?? candidate.id }));
  const roles = challenge.task.roles ?? [];

  return (
    <>
      <div className="inspector-header">
        <TypeIcon type={component.type} category={type?.category} />
        <div className="inspector-title">
          <span className="inspector-name">{component.label ?? component.id}</span>
          <span className="inspector-type">{type?.label ?? component.type}</span>
        </div>
        <CloseButton onClose={onClose} />
      </div>
      {type?.description && <p className="inspector-description">{type.description}</p>}

      {isLocked ? (
        <p className="inspector-note">
          <Icon name="lock" size={14} strokeWidth={2.2} /> Provided by the challenge. It cannot be
          changed or removed.
        </p>
      ) : (
        <>
          <label className="field">
            <span className="field-label">Name</span>
            <input
              type="text"
              value={component.label ?? ""}
              placeholder={component.id}
              onChange={(event) => onChange(setLabel(solution, id, event.target.value))}
            />
          </label>

          {roles.length > 0 && (
            <fieldset className="field">
              <legend className="field-label">Role</legend>
              {roles.map((role) => (
                <label key={role.id} className="checkbox">
                  <input
                    type="checkbox"
                    checked={component.roles?.includes(role.id) ?? false}
                    onChange={(event) =>
                      onChange(setRole(solution, id, role.id, event.target.checked))
                    }
                  />
                  <span>
                    {role.label ?? role.id}
                    {role.description && (
                      <span className="field-help inline"> · {role.description}</span>
                    )}
                  </span>
                </label>
              ))}
            </fieldset>
          )}

          {entry?.properties.map((name) => {
            const schema = type?.properties[name];
            if (!schema) return null;
            return (
              <PropertyEditor
                key={name}
                name={name}
                schema={schema}
                value={component.properties?.[name]}
                components={others}
                onChange={(value) => onChange(setProperty(solution, id, name, value))}
              />
            );
          })}

          <button
            type="button"
            className="link-button danger"
            onClick={() => onRemove({ kind: "component", id })}
          >
            Delete component
          </button>
        </>
      )}
    </>
  );
}

function ConnectionInspector({
  challenge,
  registry,
  solution,
  id,
  intentResult,
  onChange,
  onRemove,
  onClose,
}: InspectorProps & { id: string }) {
  const intent = solution.intents?.find((candidate) => candidate.id === id);
  if (!intent) return null;
  const target = solution.components.find((component) => component.id === intent.to);
  const actions = target ? connectionOptions(registry, target.type).actions : [];
  const context: MessageContext = { registry, challenge, solution };
  const problems = (intentResult?.checks ?? []).filter((check) => check.verdict !== "pass");

  return (
    <>
      <div className="inspector-header">
        <div className="inspector-title">
          <span className="inspector-name">
            {componentLabel(context, intent.from)} → {componentLabel(context, intent.to)}
          </span>
          <span className="inspector-type">Connection</span>
        </div>
        <CloseButton onClose={onClose} />
      </div>
      <p className="inspector-description">
        What the source asks of the target. Drawing it does not make it work: the settings of both
        components decide that.
      </p>
      <label className="field">
        <span className="field-label">Action</span>
        <select
          value={intent.action ?? ""}
          onChange={(event) =>
            onChange(setConnectionAction(solution, registry, id, event.target.value))
          }
        >
          {intent.action === undefined && <option value="">Choose…</option>}
          {actions.map((action) => (
            <option key={action} value={action}>
              {registry.getAction(action)?.label ?? action}
            </option>
          ))}
        </select>
      </label>
      {intent.port !== undefined && (
        <p className="field-help">
          Port:{" "}
          {typeof intent.port === "string"
            ? (registry.getPort(intent.port)?.label ?? intent.port)
            : intent.port}
        </p>
      )}
      {intentResult && (
        <div className="inspector-result">
          <VerdictBadge verdict={intentResult.verdict} kind="connection" />
          {problems.map((check) => (
            <ul key={check.check} className="evidence-list">
              {check.evidence.map((evidence, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: evidence has no id
                <li key={index}>{renderEvidence(context, evidence)}</li>
              ))}
            </ul>
          ))}
        </div>
      )}
      <button
        type="button"
        className="link-button danger"
        onClick={() => onRemove({ kind: "connection", id })}
      >
        Delete connection
      </button>
    </>
  );
}
