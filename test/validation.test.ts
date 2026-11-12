import { describe, expect, it } from "vitest";
import { createGameRegistry } from "../src/validation/registry";

describe("SolutionValidator integration", () => {
  it("loads the core and aws packs", () => {
    expect(createGameRegistry().packs.map((pack) => pack.id)).toEqual(["aws", "core"]);
  });
});
