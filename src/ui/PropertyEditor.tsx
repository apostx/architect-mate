import type { PropertySchema } from "solution-validator";

type ItemSchema = Extract<PropertySchema, { type: "array" }>["items"];
type ObjectSchema = Extract<ItemSchema, { type: "object" }>;
type FieldSchema = ObjectSchema["properties"][string];

export interface ComponentOption {
  id: string;
  label: string;
}

interface PropertyEditorProps {
  name: string;
  schema: PropertySchema;
  value: unknown;
  /** Components a reference may point to. */
  components: readonly ComponentOption[];
  /** `undefined` removes the value, so the pack default applies. */
  onChange(value: unknown): void;
}

function defaultOf(schema: PropertySchema): unknown {
  return "default" in schema ? schema.default : undefined;
}

/**
 * An editor generated from a property's schema in the pack. Only the kinds of properties the
 * challenges expose are supported: enumerations, booleans and lists of objects.
 */
export function PropertyEditor({ name, schema, value, components, onChange }: PropertyEditorProps) {
  const title = schema.title ?? name;
  const effective = value ?? defaultOf(schema);
  const help = schema.description ? <p className="field-help">{schema.description}</p> : null;

  if (schema.type === "string" && schema.enum) {
    return (
      <label className="field">
        <span className="field-label">{title}</span>
        <select
          value={typeof effective === "string" ? effective : ""}
          onChange={(event) => onChange(event.target.value)}
        >
          {schema.enum.map((option) => (
            <option key={option} value={option}>
              {option}
              {option === defaultOf(schema) ? " (default)" : ""}
            </option>
          ))}
        </select>
        {help}
      </label>
    );
  }

  if (schema.type === "boolean") {
    return (
      <div className="field">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={effective === true}
            onChange={(event) => onChange(event.target.checked)}
          />
          <span className="field-label">{title}</span>
        </label>
        {help}
      </div>
    );
  }

  if (schema.type === "array" && schema.items.type === "object") {
    const items = Array.isArray(value) ? value : [];
    const itemSchema = schema.items;
    const noun = title.replace(/s$/, "").toLowerCase();
    const canAdd = !hasReference(itemSchema) || components.length > 0;
    return (
      <fieldset className="field">
        <legend className="field-label">{title}</legend>
        {help}
        {items.length === 0 && <p className="field-empty">None yet.</p>}
        {items.map((item, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: list items have no identity of their own
          <div className="list-item" key={index}>
            {Object.entries(itemSchema.properties).map(([field, fieldSchema]) => (
              <ItemField
                key={field}
                name={field}
                schema={fieldSchema}
                value={(item as Record<string, unknown>)?.[field]}
                components={components}
                onChange={(next) =>
                  onChange(
                    items.map((current, i) =>
                      i === index ? { ...current, [field]: next } : current,
                    ),
                  )
                }
              />
            ))}
            <button
              type="button"
              className="link-button danger"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="secondary-button"
          disabled={!canAdd}
          onClick={() => onChange([...items, newItem(itemSchema, components)])}
        >
          Add {noun}
        </button>
        {!canAdd && <p className="field-help">Add another component first.</p>}
      </fieldset>
    );
  }

  return <p className="field-help">{title}: this kind of setting cannot be edited yet.</p>;
}

function hasReference(schema: ObjectSchema): boolean {
  return Object.values(schema.properties).some(
    (field) => field.type === "string" && field["x-component-ref"] === true,
  );
}

/** A new list item with every field filled, so that the solution stays valid. */
function newItem(
  schema: ObjectSchema,
  components: readonly ComponentOption[],
): Record<string, unknown> {
  const item: Record<string, unknown> = {};
  for (const [field, fieldSchema] of Object.entries(schema.properties)) {
    if (fieldSchema.type !== "string") continue;
    if (fieldSchema["x-component-ref"]) item[field] = components[0]?.id;
    else if (fieldSchema.enum) item[field] = fieldSchema.enum[0];
    else item[field] = "/";
  }
  return item;
}

function ItemField({
  name,
  schema,
  value,
  components,
  onChange,
}: {
  name: string;
  schema: FieldSchema;
  value: unknown;
  components: readonly ComponentOption[];
  onChange(value: unknown): void;
}) {
  const title = schema.title ?? name;
  if (schema.type !== "string") return null;
  const current = typeof value === "string" ? value : "";
  if (schema["x-component-ref"]) {
    const known = components.some((component) => component.id === current);
    return (
      <label className="field compact">
        <span className="field-label">{title}</span>
        <select value={current} onChange={(event) => onChange(event.target.value)}>
          {!known && <option value={current}>{current || "Choose…"}</option>}
          {components.map((component) => (
            <option key={component.id} value={component.id}>
              {component.label}
            </option>
          ))}
        </select>
      </label>
    );
  }
  if (schema.enum) {
    return (
      <label className="field compact">
        <span className="field-label">{title}</span>
        <select value={current} onChange={(event) => onChange(event.target.value)}>
          {schema.enum.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }
  return (
    <label className="field compact">
      <span className="field-label">{title}</span>
      <input type="text" value={current} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
