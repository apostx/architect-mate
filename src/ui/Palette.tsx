import type { Registry } from "solution-validator";
import type { PaletteEntry } from "../challenges/challenge";
import { DRAG_FORMAT } from "./Canvas";
import { TypeIcon } from "./icons";

interface PaletteProps {
  registry: Registry;
  palette: readonly PaletteEntry[];
  /** Adds a component of the type next to the others. */
  onAdd(type: string): void;
}

/** The component types the challenge offers. Drag one onto the canvas, or click to add it. */
export function Palette({ registry, palette, onAdd }: PaletteProps) {
  return (
    <nav className="palette floating-panel" aria-label="Components">
      <span className="panel-heading">Add</span>
      {palette.map((entry) => {
        const type = registry.getType(entry.type);
        return (
          <button
            key={entry.type}
            type="button"
            className="palette-item"
            draggable
            title={type?.description}
            onDragStart={(event) => {
              event.dataTransfer.setData(DRAG_FORMAT, entry.type);
              event.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => onAdd(entry.type)}
          >
            <TypeIcon type={entry.type} category={type?.category} size={28} />
            <span>{type?.label ?? entry.type}</span>
          </button>
        );
      })}
    </nav>
  );
}
