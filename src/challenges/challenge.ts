import {
  type AnalyzeOptions,
  type Finding,
  parseTask,
  type Registry,
  type Task,
} from "solution-validator";

/** The challenge format version this game reads. See docs/challenge-format.md. */
export const CHALLENGE_FORMAT_VERSION = 1;

/** A component type the player may add, and the properties the player may edit on it. */
export interface PaletteEntry {
  readonly type: string;
  readonly properties: readonly string[];
}

/**
 * A challenge: a SolutionValidator task, which the library validates unchanged, and the
 * game-only content next to it. The task holds the title, the provided components, the roles and
 * the requirements; the game does not repeat them.
 */
export interface Challenge {
  /** The task's id. */
  readonly id: string;
  /** The task's title, or its id. */
  readonly title: string;
  readonly difficulty: string;
  /** The scenario text, one paragraph per entry. */
  readonly scenario: readonly string[];
  /** The analysis options every evaluation of this challenge uses. */
  readonly analysis: AnalyzeOptions;
  readonly palette: readonly PaletteEntry[];
  readonly task: Task;
}

export type ParseChallengeResult =
  | { readonly ok: true; readonly challenge: Challenge }
  | {
      readonly ok: false;
      /** What is wrong with the game-only content. */
      readonly errors: readonly string[];
      /** The library's findings on the task. */
      readonly taskFindings: readonly Finding[];
    };

const ANALYSIS_KEYS = new Set(["level", "assumptions"]);
const CHALLENGE_KEYS = new Set([
  "formatVersion",
  "difficulty",
  "scenario",
  "analysis",
  "palette",
  "task",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseAnalysis(value: unknown, errors: string[]): AnalyzeOptions {
  if (!isRecord(value)) {
    errors.push("analysis must be an object.");
    return {};
  }
  for (const key of Object.keys(value)) {
    if (!ANALYSIS_KEYS.has(key)) errors.push(`analysis.${key} is not supported.`);
  }
  const options: { level?: "logical" | "detailed"; assumptions?: "strict" | "pack-defaults" } = {};
  if (value.level !== undefined) {
    if (value.level === "logical" || value.level === "detailed") options.level = value.level;
    else errors.push("analysis.level must be logical or detailed.");
  }
  if (value.assumptions !== undefined) {
    if (value.assumptions === "strict" || value.assumptions === "pack-defaults") {
      options.assumptions = value.assumptions;
    } else {
      errors.push("analysis.assumptions must be strict or pack-defaults.");
    }
  }
  return options;
}

function parsePalette(value: unknown, registry: Registry, errors: string[]): PaletteEntry[] {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push("palette must be a non-empty array.");
    return [];
  }
  const seen = new Set<string>();
  return value.flatMap((entry, index): PaletteEntry[] => {
    const path = `palette[${index}]`;
    if (!isRecord(entry) || !isNonEmptyString(entry.type) || !Array.isArray(entry.properties)) {
      errors.push(`${path} must have a type and a properties array.`);
      return [];
    }
    const type = registry.getType(entry.type);
    if (!type) {
      errors.push(`${path}.type ${entry.type} is not a known component type.`);
      return [];
    }
    if (seen.has(entry.type)) errors.push(`${path}.type ${entry.type} is listed twice.`);
    seen.add(entry.type);
    const properties = entry.properties.filter((name): name is string => {
      if (typeof name === "string" && name in type.properties) return true;
      errors.push(`${path}.properties: ${String(name)} is not a property of ${entry.type}.`);
      return false;
    });
    return [{ type: entry.type, properties }];
  });
}

/**
 * Validates a challenge file. The task goes through the library's `parseTask`; the game-only
 * content is checked here. Never throws for invalid input.
 */
export function parseChallenge(input: unknown, registry: Registry): ParseChallengeResult {
  const errors: string[] = [];
  if (!isRecord(input)) {
    return { ok: false, errors: ["A challenge must be an object."], taskFindings: [] };
  }
  for (const key of Object.keys(input)) {
    if (!CHALLENGE_KEYS.has(key)) errors.push(`${key} is not a challenge field.`);
  }
  if (input.formatVersion !== CHALLENGE_FORMAT_VERSION) {
    errors.push(`formatVersion must be ${CHALLENGE_FORMAT_VERSION}.`);
  }
  if (!isNonEmptyString(input.difficulty)) errors.push("difficulty must be a non-empty string.");
  const scenario = input.scenario;
  if (!Array.isArray(scenario) || scenario.length === 0 || !scenario.every(isNonEmptyString)) {
    errors.push("scenario must be a non-empty array of paragraphs.");
  }
  const analysis = parseAnalysis(input.analysis, errors);
  const palette = parsePalette(input.palette, registry, errors);

  const parsedTask = parseTask(input.task, registry);
  if (!parsedTask.ok) return { ok: false, errors, taskFindings: parsedTask.findings };
  const task = parsedTask.task;

  const packs = new Set(registry.resolvePacks(task.packs));
  for (const entry of palette) {
    const pack = registry.getType(entry.type)?.pack;
    if (pack !== undefined && !packs.has(pack)) {
      errors.push(`palette type ${entry.type} is from pack ${pack}, which the task does not use.`);
    }
  }
  for (const provided of task.provided ?? []) {
    if (!isPosition(provided.meta?.position)) {
      errors.push(`task.provided ${provided.id} needs meta.position with numeric x and y.`);
    }
  }

  if (errors.length > 0) return { ok: false, errors, taskFindings: parsedTask.findings };
  return {
    ok: true,
    challenge: {
      id: task.id,
      title: task.title ?? task.id,
      difficulty: input.difficulty as string,
      scenario: scenario as string[],
      analysis,
      palette,
      task,
    },
  };
}

/** A position on the canvas, kept in a component's `meta.position`. */
export interface Position {
  readonly x: number;
  readonly y: number;
}

export function isPosition(value: unknown): value is Position {
  return isRecord(value) && Number.isFinite(value.x) && Number.isFinite(value.y);
}
