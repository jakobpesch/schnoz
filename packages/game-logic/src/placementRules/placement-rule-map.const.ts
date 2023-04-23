import { adjacentToAllyFactory } from "./adjacent-to-ally";
import { inBounds } from "./in-bounds";
import { noTerrain } from "./no-terrain";
import { noUnit } from "./no-unit";
import { PlacementRuleName } from "types";
import { PlacementRule } from "types";

export const placementRulesMap = new Map<PlacementRuleName, PlacementRule>([
  ["NO_UNIT", noUnit],
  ["ADJACENT_TO_ALLY", adjacentToAllyFactory(1)],
  ["ADJACENT_TO_ALLY_2", adjacentToAllyFactory(2)],
  ["NO_TERRAIN", noTerrain],
  ["IN_BOUNDS", inBounds],
]);
