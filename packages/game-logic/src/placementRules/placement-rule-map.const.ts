import { adjacentToUnitFactory } from "./adjacent-to-ally"
import { inBounds } from "./in-bounds"
import { noTerrain } from "./no-terrain"
import { noUnit } from "./no-unit"
import { PlacementRuleName } from "types"
import { PlacementRule } from "types"

export const placementRulesMap: Record<PlacementRuleName, PlacementRule> = {
  NO_UNIT: noUnit,
  ADJACENT_TO_ENEMY: adjacentToUnitFactory(1, "enemy"),
  ADJACENT_TO_ENEMY_2: adjacentToUnitFactory(2, "enemy"),
  ADJACENT_TO_ALLY: adjacentToUnitFactory(1, "ally"),
  ADJACENT_TO_ALLY_2: adjacentToUnitFactory(2, "ally"),
  ADJACENT_TO_UNIT: adjacentToUnitFactory(1, "none"),
  ADJACENT_TO_UNIT_2: adjacentToUnitFactory(2, "none"),
  NO_TERRAIN: noTerrain,
  IN_BOUNDS: inBounds,
}
