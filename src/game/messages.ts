import {
  EVIDENCE_CODES,
  type Evidence,
  type EvidenceCode,
  type Registry,
  renderMessage,
  type Solution,
} from "solution-validator";
import type { Challenge } from "../challenges/challenge";

/**
 * Renders the library's evidence for the player. The text comes from the evidence code's
 * template and parameters (SolutionValidator lets consumers render messages from them). The game
 * only changes the wording: component, connection, type and role ids become their labels, and a
 * few templates say "connection" for the library's "intent" and "permission" for "grant". It never
 * adds a reason of its own.
 */

/** Player wording for codes whose library template uses the model's terms. */
const TEMPLATES: Partial<Record<EvidenceCode, string>> = {
  ACCEPTED: "{toType} accepts {purpose} from {fromType}.",
  PURPOSE_MISSING: "The connection states neither an action nor a port.",
  ACTION_REQUIRED: "{to} controls access per action, but the connection states no action.",
  GRANT_FOUND: "{from} has {access} permission on {to}, which allows {action}.",
  GRANT_MISSING: "{from} has no permission on {to} that allows {action}.",
  PROPERTY_ASSUMED: "{component} does not set {property}; the default, {value}, applies.",
  PATH_FOUND: "Works: {path}.",
  PATH_UNDECIDABLE: "A chain exists, {path}, but these connections are undecidable: {intents}.",
  PATH_MISSING: "No chain of working connections leads from {from} to {to}{purpose}.",
  NOT_ACCESSIBLE: "Not directly accessible ({pairs} combinations checked).",
};

/** Parameters that name a component type. */
const TYPE_PARAMS = new Set(["type", "fromType", "toType"]);
/** Parameters that hold a selector description, such as "role order-store". */
const SELECTOR_PARAMS = new Set(["selector"]);
const SELECTOR_CODES = new Set<EvidenceCode>(["PATH_MISSING"]);

export interface MessageContext {
  readonly registry: Registry;
  readonly challenge: Challenge;
  readonly solution: Solution;
}

export function componentLabel(context: MessageContext, id: string): string {
  const component = context.solution.components.find((candidate) => candidate.id === id);
  return component?.label ?? id;
}

export function typeLabel(context: MessageContext, type: string): string {
  return context.registry.getType(type)?.label ?? type;
}

export function roleLabel(context: MessageContext, role: string): string {
  return context.challenge.task.roles?.find((candidate) => candidate.id === role)?.label ?? role;
}

/** "Orders API → Place order", for a connection. */
export function connectionLabel(context: MessageContext, id: string): string {
  const intent = context.solution.intents?.find((candidate) => candidate.id === id);
  if (!intent) return id;
  return `${componentLabel(context, intent.from)} → ${componentLabel(context, intent.to)}`;
}

/** Renders a selector description of the library ("type aws.s3 and role order-store"). */
function describeSelector(context: MessageContext, text: string): string {
  const parts = text.split(" and ");
  const rendered = parts.map((part) => {
    const match = /^(id|type|category|trait|role) (\S+)$/.exec(part);
    if (!match) return undefined;
    const [, key, value] = match as unknown as [string, string, string];
    switch (key) {
      case "id":
        return componentLabel(context, value);
      case "type":
        return `a ${typeLabel(context, value)}`;
      case "category":
        return `a ${context.registry.getCategory(value)?.label.toLowerCase() ?? value}`;
      case "role":
        return `the ${roleLabel(context, value).toLowerCase()}`;
      default:
        return `a component with ${value}`;
    }
  });
  return rendered.every((part) => part !== undefined) ? rendered.join(" that is ") : text;
}

/** Renders a chain of the library ("users → api (i1) → fn (i2)") with labels. See #45. */
function describePath(context: MessageContext, path: string): string {
  return path
    .split(" → ")
    .map((step) => {
      const match = /^(\S+)(?: \((\S+)\))?$/.exec(step);
      return match?.[1] ? componentLabel(context, match[1]) : step;
    })
    .join(" → ");
}

function describeValue(context: MessageContext, code: EvidenceCode, name: string, value: unknown) {
  if (typeof value !== "string") return value;
  if (TYPE_PARAMS.has(name)) return typeLabel(context, value);
  if (SELECTOR_PARAMS.has(name) || (SELECTOR_CODES.has(code) && (name === "from" || name === "to")))
    return describeSelector(context, value);
  if (name === "path") return describePath(context, value);
  if (name === "intents") {
    return value
      .split(", ")
      .map((id) => connectionLabel(context, id))
      .join(", ");
  }
  if (name === "role") return roleLabel(context, value);
  if (name === "property") return propertyTitle(context, value);
  if (context.solution.components.some((component) => component.id === value)) {
    return componentLabel(context, value);
  }
  if (context.solution.intents?.some((intent) => intent.id === value)) {
    return connectionLabel(context, value);
  }
  return value;
}

/** A property's title from any type of the challenge's palette, in lower case. */
function propertyTitle(context: MessageContext, name: string): string {
  for (const entry of context.challenge.palette) {
    const title = context.registry.getType(entry.type)?.properties[name]?.title;
    if (title) return title.toLowerCase();
  }
  return name;
}

export function renderEvidence(context: MessageContext, evidence: Evidence): string {
  const template = TEMPLATES[evidence.code] ?? EVIDENCE_CODES[evidence.code]?.template;
  if (!template) return evidence.message;
  const params = Object.fromEntries(
    Object.entries(evidence.params).map(([name, value]) => [
      name,
      describeValue(context, evidence.code, name, value),
    ]),
  );
  return renderMessage(template, params as Evidence["params"]);
}
