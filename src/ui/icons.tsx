import type { ReactNode } from "react";

/** Simple stroke icons. Generic shapes, not provider artwork. */
const PATHS: Record<string, ReactNode> = {
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </>
  ),
  api: (
    <path d="M8 4H6a2 2 0 0 0-2 2v4l-2 2 2 2v4a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v4l2 2-2 2v4a2 2 0 0 1-2 2h-2" />
  ),
  function: <path d="M6 4h3l7 16h3M12.5 12 7 20" />,
  database: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </>
  ),
  bucket: (
    <>
      <path d="M4 6h16l-2 14H6L4 6z" />
      <ellipse cx="12" cy="6" rx="8" ry="2.5" />
    </>
  ),
  box: <rect x="4" y="4" width="16" height="16" rx="3" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  cross: <path d="M6 6l12 12M18 6L6 18" />,
  question: (
    <>
      <path d="M9.2 9a3 3 0 1 1 4.3 2.7c-.9.4-1.5 1.2-1.5 2.2v.6" />
      <path d="M12 18h.01" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  chevronUp: <path d="M6 15l6-6 6 6" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
};

export type IconName = keyof typeof PATHS;

const TYPE_ICONS: Record<string, IconName> = {
  "core.internet": "globe",
  "aws.api-gateway": "api",
  "aws.lambda": "function",
  "aws.dynamodb": "database",
  "aws.s3": "bucket",
};

const CATEGORY_ICONS: Record<string, IconName> = {
  external: "globe",
  edge: "api",
  compute: "function",
  "data-store": "database",
};

export function iconFor(type: string, category: string | undefined): IconName {
  return TYPE_ICONS[type] ?? (category ? CATEGORY_ICONS[category] : undefined) ?? "box";
}

export function Icon({
  name,
  size = 18,
  strokeWidth = 1.9,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

/** The icon of a component type in its category's colors. */
export function TypeIcon({
  type,
  category,
  size = 32,
}: {
  type: string;
  category: string | undefined;
  size?: number;
}) {
  return (
    <span
      className={`type-icon category-${category ?? "unknown"}`}
      style={{ width: size, height: size }}
    >
      <Icon name={iconFor(type, category)} size={Math.round(size * 0.56)} />
    </span>
  );
}
