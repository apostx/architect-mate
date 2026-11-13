import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { IntentVerdict, Registry, Solution, Verdict } from "solution-validator";
import type { Challenge, Position } from "../challenges/challenge";
import { type Evaluation, evaluate } from "../game/evaluate";
import { componentLabel, type MessageContext } from "../game/messages";
import {
  addComponent,
  addConnection,
  connectionOptions,
  initialSolution,
  lockedIds,
  positionOf,
  removeComponent,
  removeConnection,
} from "../game/solution";
import { Brief } from "./Brief";
import { Canvas, type Selection } from "./Canvas";
import { Inspector } from "./Inspector";
import { Icon } from "./icons";
import { Palette } from "./Palette";
import { ResultsDrawer } from "./ResultsDrawer";

interface ChallengeScreenProps {
  challenge: Challenge;
  registry: Registry;
}

export function ChallengeScreen(props: ChallengeScreenProps) {
  return (
    <ReactFlowProvider>
      <ChallengeWorkspace {...props} />
    </ReactFlowProvider>
  );
}

/** What decides the verdicts: everything but the canvas positions in `meta`. */
function designKey(solution: Solution): string {
  return JSON.stringify({
    components: solution.components.map(({ meta: _meta, ...rest }) => rest),
    intents: solution.intents ?? [],
  });
}

interface EvaluationState {
  result: Evaluation;
  solution: Solution;
  key: string;
}

const NO_RESULTS: readonly IntentVerdict[] = [];

interface PendingConnection {
  from: string;
  to: string;
  actions: readonly string[];
  /** Where the chooser opens, relative to the canvas. */
  point: Position;
}

function ChallengeWorkspace({ challenge, registry }: ChallengeScreenProps) {
  const flow = useReactFlow();
  const canvasRef = useRef<HTMLDivElement>(null);
  const locked = useMemo(() => lockedIds(challenge), [challenge]);
  const [solution, setSolution] = useState(() => initialSolution(challenge));
  const [selection, setSelection] = useState<Selection>(null);
  const [evaluation, setEvaluation] = useState<EvaluationState | null>(null);
  const [briefOpen, setBriefOpen] = useState(true);
  const [resultsExpanded, setResultsExpanded] = useState(true);
  const [pending, setPending] = useState<PendingConnection | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const context: MessageContext = { registry, challenge, solution };
  const outdated = evaluation !== null && evaluation.key !== designKey(solution);
  const intentResults =
    evaluation && !outdated && evaluation.result.status === "evaluated"
      ? evaluation.result.intents
      : NO_RESULTS;
  const verdicts = useMemo(
    () => new Map<string, Verdict>(intentResults.map((result) => [result.intent, result.verdict])),
    [intentResults],
  );

  // The results take room from the canvas: show the whole design next to them.
  useEffect(() => {
    if (!evaluation) return;
    const frame = requestAnimationFrame(() => {
      void flow.fitView({ padding: 0.2, maxZoom: 1, duration: 250 });
    });
    return () => cancelAnimationFrame(frame);
  }, [evaluation, flow]);

  useEffect(() => {
    if (!pending && !notice) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPending(null);
        setNotice(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending, notice]);

  function add(type: string, position: Position) {
    const added = addComponent(solution, registry, type, position);
    setSolution(added.solution);
    setSelection({ kind: "component", id: added.id });
  }

  /** Adds a component to the right of the others, and pans to it when it is out of view. */
  function addNext(type: string) {
    const positions = solution.components.map(positionOf);
    const last = positions.at(-1) ?? { x: 0, y: 0 };
    const right = Math.max(...positions.map((position) => position.x), last.x);
    const position = { x: right + 240, y: last.y };
    add(type, position);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const topLeft = flow.screenToFlowPosition({ x: rect.left, y: rect.top });
    const bottomRight = flow.screenToFlowPosition({ x: rect.right, y: rect.bottom });
    const visible =
      position.x >= topLeft.x &&
      position.x + 200 <= bottomRight.x &&
      position.y >= topLeft.y &&
      position.y + 80 <= bottomRight.y;
    if (!visible) {
      void flow.setCenter(position.x + 90, position.y + 30, {
        zoom: flow.getZoom(),
        duration: 250,
      });
    }
  }

  function remove(target: NonNullable<Selection>) {
    if (target.kind === "component") {
      if (locked.has(target.id)) return;
      setSolution((current) => removeComponent(current, registry, target.id, locked));
    } else {
      setSolution((current) => removeConnection(current, target.id));
    }
    setSelection((current) => (current?.id === target.id ? null : current));
  }

  function connect(from: string, to: string, point: Position) {
    setNotice(null);
    const target = solution.components.find((component) => component.id === to);
    if (!target) return;
    const { actions } = connectionOptions(registry, target.type);
    if (actions.length === 0) {
      setNotice(`${componentLabel(context, to)} does not accept requests from other components.`);
      return;
    }
    if (actions.length === 1) {
      finishConnection(from, to, actions[0] as string);
      return;
    }
    const rect = canvasRef.current?.getBoundingClientRect();
    setPending({
      from,
      to,
      actions,
      point: { x: point.x - (rect?.left ?? 0), y: point.y - (rect?.top ?? 0) },
    });
  }

  function finishConnection(from: string, to: string, action: string) {
    const added = addConnection(solution, registry, from, to, action);
    setSolution(added.solution);
    setSelection({ kind: "connection", id: added.id });
    setPending(null);
  }

  function runEvaluation() {
    setEvaluation({
      result: evaluate(challenge, solution, registry),
      solution,
      key: designKey(solution),
    });
    setResultsExpanded(true);
  }

  const selected =
    selection &&
    (selection.kind === "component"
      ? solution.components.some((component) => component.id === selection.id)
      : solution.intents?.some((intent) => intent.id === selection.id))
      ? selection
      : null;

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">ArchitectMate</span>
        <span className="topbar-divider" aria-hidden="true" />
        <h1 className="challenge-title">{challenge.title}</h1>
        <span className="tag">{challenge.difficulty}</span>
        <span className="topbar-spacer" />
        <button
          type="button"
          className="secondary-button"
          aria-expanded={briefOpen}
          onClick={() => setBriefOpen((open) => !open)}
        >
          {briefOpen ? "Hide brief" : "Show brief"}
        </button>
        <button type="button" className="primary-button" onClick={runEvaluation}>
          <Icon name="check" size={18} strokeWidth={2.2} />
          Evaluate solution
        </button>
      </header>

      {briefOpen && <Brief challenge={challenge} />}

      <main className="workspace">
        <Canvas
          challenge={challenge}
          registry={registry}
          solution={solution}
          locked={locked}
          selection={selected}
          verdicts={verdicts}
          containerRef={canvasRef}
          onSelect={setSelection}
          onChange={setSolution}
          onAdd={add}
          onRemove={remove}
          onConnect={connect}
        />
        <Palette registry={registry} palette={challenge.palette} onAdd={addNext} />
        {selected && (
          <Inspector
            key={`${selected.kind}:${selected.id}`}
            challenge={challenge}
            registry={registry}
            solution={solution}
            locked={locked}
            selection={selected}
            intentResult={intentResults.find((result) => result.intent === selected.id)}
            onChange={setSolution}
            onRemove={remove}
            onClose={() => setSelection(null)}
          />
        )}
        {pending && (
          <div
            className="action-chooser floating-panel"
            role="dialog"
            aria-label="Choose the connection's action"
            style={{ left: pending.point.x, top: pending.point.y }}
          >
            <p>
              What does {componentLabel(context, pending.from)} do with{" "}
              {componentLabel(context, pending.to)}?
            </p>
            <div className="action-chooser-buttons">
              {pending.actions.map((action) => (
                <button
                  key={action}
                  type="button"
                  className="secondary-button"
                  onClick={() => finishConnection(pending.from, pending.to, action)}
                >
                  {registry.getAction(action)?.label ?? action}
                </button>
              ))}
              <button type="button" className="link-button" onClick={() => setPending(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
        {notice && (
          <div className="notice floating-panel" role="status">
            {notice}
            <button type="button" className="link-button" onClick={() => setNotice(null)}>
              Dismiss
            </button>
          </div>
        )}
        {solution.components.length === (challenge.task.provided ?? []).length && (
          <p className="canvas-hint">
            Drag components from the left onto the canvas, then connect them from a component's
            right edge.
          </p>
        )}
      </main>

      {evaluation && (
        <ResultsDrawer
          evaluation={evaluation.result}
          context={{ registry, challenge, solution: evaluation.solution }}
          outdated={outdated}
          expanded={resultsExpanded}
          onToggle={() => setResultsExpanded((open) => !open)}
          onSelectConnection={(id) => {
            if (solution.intents?.some((intent) => intent.id === id)) {
              setSelection({ kind: "connection", id });
            }
          }}
        />
      )}
    </div>
  );
}
