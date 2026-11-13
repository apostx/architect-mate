import {
  Background,
  type Connection,
  Controls,
  type EdgeChange,
  MarkerType,
  type NodeChange,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import { type DragEvent, type RefObject, useMemo, useRef, useState } from "react";
import type { Registry, Solution, Verdict } from "solution-validator";
import type { Challenge, Position } from "../challenges/challenge";
import { roleLabel } from "../game/messages";
import { moveComponent, positionOf } from "../game/solution";
import { ComponentNode, type ComponentNodeType } from "./ComponentNode";
import { ConnectionEdge, type ConnectionEdgeType } from "./ConnectionEdge";

export type Selection = { kind: "component" | "connection"; id: string } | null;

/** The drag-and-drop data type the palette uses for a component type id. */
export const DRAG_FORMAT = "application/x-architectmate-type";

const nodeTypes = { component: ComponentNode };
const edgeTypes = { connection: ConnectionEdge };

interface CanvasProps {
  challenge: Challenge;
  registry: Registry;
  solution: Solution;
  locked: ReadonlySet<string>;
  selection: Selection;
  /** Connection verdicts of the latest evaluation, while it is up to date. */
  verdicts: ReadonlyMap<string, Verdict>;
  containerRef: RefObject<HTMLDivElement | null>;
  onSelect(selection: Selection): void;
  onChange(solution: Solution): void;
  onAdd(type: string, position: Position): void;
  onRemove(selection: NonNullable<Selection>): void;
  /** The player drew a connection; the screen asks for its action where needed. */
  onConnect(from: string, to: string, point: { x: number; y: number }): void;
}

interface Size {
  width: number;
  height: number;
}

/**
 * The diagram. Nodes are controlled: positions come from the solution's `meta.position`; while a
 * node is dragged its position is kept locally and written back when the drag ends. Adapted from
 * the SolutionValidator demo's canvas.
 */
export function Canvas({
  challenge,
  registry,
  solution,
  locked,
  selection,
  verdicts,
  containerRef,
  onSelect,
  onChange,
  onAdd,
  onRemove,
  onConnect,
}: CanvasProps) {
  const flow = useReactFlow();
  const [dragging, setDragging] = useState<Record<string, Position>>({});
  const [measured, setMeasured] = useState<Record<string, Size>>({});
  const draggingRef = useRef(dragging);
  draggingRef.current = dragging;
  const pointer = useRef({ x: 0, y: 0 });

  const nodes = useMemo<ComponentNodeType[]>(
    () =>
      solution.components.map((component) => {
        const type = registry.getType(component.type);
        const size = measured[component.id];
        return {
          id: component.id,
          type: "component",
          position: dragging[component.id] ?? positionOf(component),
          ...(size ? { measured: size } : {}),
          selected: selection?.kind === "component" && selection.id === component.id,
          deletable: !locked.has(component.id),
          data: {
            label: component.label ?? component.id,
            type: component.type,
            typeLabel: type?.label ?? component.type,
            category: type?.category,
            roles: (component.roles ?? []).map((role) =>
              roleLabel({ registry, challenge, solution }, role),
            ),
            locked: locked.has(component.id),
          },
        };
      }),
    [solution, registry, challenge, dragging, measured, selection, locked],
  );

  const edges = useMemo<ConnectionEdgeType[]>(
    () =>
      (solution.intents ?? []).map((intent) => {
        const verdict = verdicts.get(intent.id);
        return {
          id: intent.id,
          type: "connection",
          source: intent.from,
          target: intent.to,
          markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
          className: verdict ? `verdict-${verdict}` : "",
          selected: selection?.kind === "connection" && selection.id === intent.id,
          data: {
            purpose: [intent.action, intent.port].filter((part) => part !== undefined).join(" · "),
            verdict,
          },
        };
      }),
    [solution.intents, verdicts, selection],
  );

  function onNodesChange(changes: NodeChange<ComponentNodeType>[]) {
    let next = solution;
    const overrides = { ...draggingRef.current };
    for (const change of changes) {
      if (change.type === "position") {
        if (change.position) overrides[change.id] = change.position;
        if (change.dragging === false) {
          const position = overrides[change.id];
          if (position) next = moveComponent(next, change.id, position);
          delete overrides[change.id];
        }
      } else if (change.type === "dimensions" && change.dimensions) {
        const { width, height } = change.dimensions;
        setMeasured((current) => ({ ...current, [change.id]: { width, height } }));
      } else if (change.type === "remove") {
        onRemove({ kind: "component", id: change.id });
      }
    }
    setDragging(overrides);
    if (next !== solution) onChange(next);
  }

  function onEdgesChange(changes: EdgeChange<ConnectionEdgeType>[]) {
    for (const change of changes) {
      if (change.type === "remove") onRemove({ kind: "connection", id: change.id });
    }
  }

  function handleConnect(connection: Connection) {
    if (connection.source === connection.target) return;
    onConnect(connection.source, connection.target, pointer.current);
  }

  function onDrop(event: DragEvent) {
    const type = event.dataTransfer.getData(DRAG_FORMAT);
    if (!type) return;
    event.preventDefault();
    const position = flow.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    onAdd(type, { x: position.x - 80, y: position.y - 30 });
  }

  return (
    <div
      className="canvas"
      ref={containerRef}
      onPointerMove={(event) => {
        pointer.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        pointer.current = { x: event.clientX, y: event.clientY };
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={(_event, node) => onSelect({ kind: "component", id: node.id })}
        onEdgeClick={(_event, edge) => onSelect({ kind: "connection", id: edge.id })}
        onPaneClick={() => onSelect(null)}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDrop={onDrop}
        elevateEdgesOnSelect={false}
        deleteKeyCode={["Backspace", "Delete"]}
        fitView
        fitViewOptions={{ padding: 0.4, maxZoom: 1 }}
        minZoom={0.3}
        maxZoom={1.75}
      >
        <Background gap={20} />
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>
    </div>
  );
}
