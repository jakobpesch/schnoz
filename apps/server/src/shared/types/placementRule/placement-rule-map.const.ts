import { adjacentToAllyFactory } from 'src/gameLogic/placementRules/adjacent-to-ally';
import { inBounds } from 'src/gameLogic/placementRules/in-bounds';
import { noTerrain } from 'src/gameLogic/placementRules/no-terrain';
import { noUnit } from 'src/gameLogic/placementRules/no-unit';
import { PlacementRuleName } from './placement-rule-name.type';
import { PlacementRule } from './placement-rule.type';

export const placementRulesMap = new Map<PlacementRuleName, PlacementRule>([
  ['NO_UNIT', noUnit],
  ['ADJACENT_TO_ALLY', adjacentToAllyFactory(1)],
  ['ADJACENT_TO_ALLY_2', adjacentToAllyFactory(2)],
  ['NO_TERRAIN', noTerrain],
  ['IN_BOUNDS', inBounds],
]);
