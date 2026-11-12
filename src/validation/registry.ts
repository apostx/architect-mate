import { createRegistry, type Registry } from "solution-validator";
import awsPack from "solution-validator/packs/aws";
import corePack from "solution-validator/packs/core";

/**
 * Creates the registry of the packs the game uses.
 *
 * Component types, their behavior and every verdict come from SolutionValidator's packs.
 * The game does not define component types or validation rules of its own.
 */
export function createGameRegistry(): Registry {
  return createRegistry([corePack, awsPack]);
}
