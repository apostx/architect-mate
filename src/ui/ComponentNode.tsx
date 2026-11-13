import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import { Icon, TypeIcon } from "./icons";

export type ComponentNodeData = {
  label: string;
  type: string;
  typeLabel: string;
  category: string | undefined;
  /** Labels of the roles the player gave the component. */
  roles: readonly string[];
  locked: boolean;
};

export type ComponentNodeType = Node<ComponentNodeData, "component">;

/** A component on the canvas: its icon, name, type and roles. */
export function ComponentNode({ data, selected }: NodeProps<ComponentNodeType>) {
  return (
    <div className={`component-node${selected ? " selected" : ""}`}>
      <Handle type="target" position={Position.Left} />
      <div className="component-node-main">
        <TypeIcon type={data.type} category={data.category} />
        <span className="component-node-text">
          <span className="component-node-label">{data.label}</span>
          <span className="component-node-type">
            {data.typeLabel}
            {data.locked && (
              <span className="component-node-locked" title="Provided by the challenge">
                <Icon name="lock" size={12} strokeWidth={2.2} /> provided
              </span>
            )}
          </span>
        </span>
      </div>
      {data.roles.length > 0 && (
        <div className="component-node-roles">
          {data.roles.map((role) => (
            <span key={role} className="role-badge">
              {role}
            </span>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
