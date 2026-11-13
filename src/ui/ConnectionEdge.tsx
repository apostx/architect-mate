import {
  BaseEdge,
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import type { Verdict } from "solution-validator";
import { Icon } from "./icons";

export type ConnectionEdgeData = {
  /** "invoke · https" */
  purpose: string;
  /** The connection's verdict from the latest evaluation, while it is up to date. */
  verdict?: Verdict | undefined;
};

export type ConnectionEdgeType = Edge<ConnectionEdgeData, "connection">;

const MARKS = { pass: "check", fail: "cross", undecidable: "question" } as const;

/** A connection arrow with its action and, after an evaluation, whether it works. */
export function ConnectionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  selected,
  data,
}: EdgeProps<ConnectionEdgeType>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const verdict = data?.verdict;
  const classes = ["connection-label"];
  if (verdict) classes.push(`verdict-${verdict}`);
  if (selected) classes.push("selected");
  return (
    <>
      <BaseEdge id={id} path={path} {...(markerEnd ? { markerEnd } : {})} />
      <EdgeLabelRenderer>
        <div
          className={classes.join(" ")}
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
        >
          {verdict && <Icon name={MARKS[verdict]} size={11} strokeWidth={3} />}
          {data?.purpose}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
