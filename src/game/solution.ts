import type { Component, Intent, PropertySchema, Registry, Solution } from "solution-validator";
import { type Challenge, isPosition, type Position } from "../challenges/challenge";

/**
 * Editing operations on the player's solution. The editor's state is a SolutionValidator
 * solution; canvas positions live in the components' free-form `meta`. These functions only edit
 * it: whether the result works is decided by the library when the player evaluates.
 */

/** The solution a challenge starts with: its provided components and nothing else. */
export function initialSolution(challenge: Challenge): Solution {
  return {
    schemaVersion: 1,
    packs: [...challenge.task.packs],
    components: (challenge.task.provided ?? []).map((provided) => ({
      id: provided.id,
      type: provided.type,
      ...(provided.label === undefined ? {} : { label: provided.label }),
      ...(provided.properties === undefined ? {} : { properties: { ...provided.properties } }),
      meta: { ...provided.meta },
    })),
    intents: [],
  };
}

/** Ids of the components the challenge provides and locks. */
export function lockedIds(challenge: Challenge): Set<string> {
  return new Set(
    (challenge.task.provided ?? [])
      .filter((provided) => provided.locked === true)
      .map((provided) => provided.id),
  );
}

export function positionOf(component: Component): Position {
  const position = component.meta?.position;
  return isPosition(position) ? { x: position.x, y: position.y } : { x: 0, y: 0 };
}

function takenIds(solution: Solution): Set<string> {
  return new Set([
    ...solution.components.map((component) => component.id),
    ...(solution.intents ?? []).map((intent) => intent.id),
  ]);
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueId(taken: Set<string>, base: string): string {
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    const id = `${base}-${n}`;
    if (!taken.has(id)) return id;
  }
}

function rounded(position: Position): Position {
  return { x: Math.round(position.x), y: Math.round(position.y) };
}

/**
 * Adds a component of a type at a position. Its id and label come from the type's label
 * ("Lambda function 2", id `lambda-function-2`); the player can rename it.
 */
export function addComponent(
  solution: Solution,
  registry: Registry,
  type: string,
  position: Position,
): { solution: Solution; id: string } {
  const typeLabel = registry.getType(type)?.label ?? type;
  const taken = takenIds(solution);
  let n = solution.components.filter((component) => component.type === type).length + 1;
  while (taken.has(slug(`${typeLabel} ${n}`))) n++;
  const label = `${typeLabel} ${n}`;
  const id = uniqueId(taken, slug(label) || "component");
  const component: Component = { id, type, label, meta: { position: rounded(position) } };
  return { solution: { ...solution, components: [...solution.components, component] }, id };
}

function updateComponent(
  solution: Solution,
  id: string,
  update: (component: Component) => Component,
): Solution {
  return {
    ...solution,
    components: solution.components.map((component) =>
      component.id === id ? update(component) : component,
    ),
  };
}

export function moveComponent(solution: Solution, id: string, position: Position): Solution {
  return updateComponent(solution, id, (component) => ({
    ...component,
    meta: { ...component.meta, position: rounded(position) },
  }));
}

/** Sets the display name; an empty name falls back to the id. */
export function setLabel(solution: Solution, id: string, label: string): Solution {
  return updateComponent(solution, id, (component) => {
    const { label: _old, ...rest } = component;
    return label.trim() === "" ? rest : { ...rest, label };
  });
}

/** Gives a role to a component, or takes it away. */
export function setRole(solution: Solution, id: string, role: string, on: boolean): Solution {
  return updateComponent(solution, id, (component) => {
    const current = component.roles ?? [];
    const roles = on
      ? [...current.filter((existing) => existing !== role), role]
      : current.filter((existing) => existing !== role);
    const { roles: _old, ...rest } = component;
    return roles.length > 0 ? { ...rest, roles } : rest;
  });
}

/** Sets a property, or removes it when `value` is undefined (the pack default applies then). */
export function setProperty(
  solution: Solution,
  id: string,
  name: string,
  value: unknown,
): Solution {
  return updateComponent(solution, id, (component) => {
    const properties = { ...component.properties };
    if (value === undefined) delete properties[name];
    else properties[name] = value;
    const { properties: _old, ...rest } = component;
    return Object.keys(properties).length > 0 ? { ...rest, properties } : rest;
  });
}

/** Removes references to `removed` from a property value, following its schema. */
function withoutReferences(schema: PropertySchema, value: unknown, removed: string): unknown {
  if (schema.type === "string" && schema["x-component-ref"]) {
    return value === removed ? undefined : value;
  }
  if (schema.type === "array" && Array.isArray(value)) {
    const items = schema.items;
    if (items.type === "string" && items["x-component-ref"]) {
      return value.filter((item) => item !== removed);
    }
    if (items.type === "object") {
      const refFields = Object.entries(items.properties)
        .filter(([, field]) => field.type === "string" && field["x-component-ref"] === true)
        .map(([name]) => name);
      return value.filter(
        (item) =>
          typeof item !== "object" ||
          item === null ||
          !refFields.some((field) => (item as Record<string, unknown>)[field] === removed),
      );
    }
  }
  return value;
}

/**
 * Removes a component, the connections to and from it, and the references to it in other
 * components' properties (for example a permission on a removed table). Locked components stay.
 */
export function removeComponent(
  solution: Solution,
  registry: Registry,
  id: string,
  locked: ReadonlySet<string>,
): Solution {
  if (locked.has(id)) return solution;
  const components = solution.components
    .filter((component) => component.id !== id)
    .map((component) => {
      const schemas = registry.getType(component.type)?.properties ?? {};
      if (!component.properties) return component;
      let changed = false;
      const properties: Record<string, unknown> = {};
      for (const [name, value] of Object.entries(component.properties)) {
        const schema = schemas[name];
        const next = schema ? withoutReferences(schema, value, id) : value;
        if (next !== value) changed = true;
        if (next !== undefined) properties[name] = next;
      }
      return changed ? { ...component, properties } : component;
    });
  return {
    ...solution,
    components,
    intents: (solution.intents ?? []).filter((intent) => intent.from !== id && intent.to !== id),
  };
}

/** What a new connection can ask for: the actions the target's type accepts. */
export interface ConnectionOptions {
  /** Actions any `accepts` rule of the target's type names, in rule order. */
  readonly actions: readonly string[];
}

/**
 * The actions to offer for a connection to a target. They come from the target type's `accepts`
 * rules, from any source: the editor does not decide whether the connection works, so the
 * player can draw a wrong one and the library explains why it fails.
 */
export function connectionOptions(registry: Registry, targetType: string): ConnectionOptions {
  const rules = registry.getType(targetType)?.accepts ?? [];
  const actions: string[] = [];
  for (const rule of rules) {
    for (const action of rule.actions ?? []) if (!actions.includes(action)) actions.push(action);
  }
  return { actions };
}

/**
 * The port a connection with this action uses: set when every `accepts` rule of the target's
 * type that names the action and limits ports names the same single port (API Gateway: https).
 * See solution-validator#43 for why the editor sets it.
 */
export function portFor(
  registry: Registry,
  targetType: string,
  action: string,
): string | undefined {
  const ports = new Set<string>();
  for (const rule of registry.getType(targetType)?.accepts ?? []) {
    if (!rule.actions?.includes(action)) continue;
    for (const port of rule.ports ?? []) ports.add(port);
  }
  return ports.size === 1 ? [...ports][0] : undefined;
}

/** Adds a connection with an action (and the port that action implies). */
export function addConnection(
  solution: Solution,
  registry: Registry,
  from: string,
  to: string,
  action: string,
): { solution: Solution; id: string } {
  const existing = (solution.intents ?? []).find(
    (intent) => intent.from === from && intent.to === to && intent.action === action,
  );
  if (existing) return { solution, id: existing.id };
  const target = solution.components.find((component) => component.id === to);
  const port = target ? portFor(registry, target.type, action) : undefined;
  const id = uniqueId(takenIds(solution), `${from}-to-${to}`);
  const intent: Intent = { id, from, to, action, ...(port === undefined ? {} : { port }) };
  return { solution: { ...solution, intents: [...(solution.intents ?? []), intent] }, id };
}

/** Changes a connection's action, and its port with it. */
export function setConnectionAction(
  solution: Solution,
  registry: Registry,
  id: string,
  action: string,
): Solution {
  return {
    ...solution,
    intents: (solution.intents ?? []).map((intent) => {
      if (intent.id !== id) return intent;
      const target = solution.components.find((component) => component.id === intent.to);
      const port = target ? portFor(registry, target.type, action) : undefined;
      const { port: _old, ...rest } = intent;
      return { ...rest, action, ...(port === undefined ? {} : { port }) };
    }),
  };
}

export function removeConnection(solution: Solution, id: string): Solution {
  return { ...solution, intents: (solution.intents ?? []).filter((intent) => intent.id !== id) };
}
