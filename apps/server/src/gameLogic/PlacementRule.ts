import { Map, Match, MatchStatus, Participant } from 'database';
import { Coordinate } from 'src/shared/types/coordinate.type';
import { TileWithUnit } from 'src/shared/types/database/tile-with-units.type';
import { PlacementRuleName } from 'src/shared/types/placementRule/placement-rule-name.type';
import { Special } from 'src/shared/types/special/special.interface';
import { TransformedConstellation } from 'src/shared/types/transformed-constellation.interface';
import {
  transformCoordinates,
  translateCoordinatesTo,
} from 'src/utils/constallationTransformer';
import { buildTileLookupId, TileLookup } from '../utils/coordinateUtils';
import { defaultGame } from './GameVariants';
import { adjacentToAllyFactory } from './placementRules/adjacent-to-ally';
import { expandBuildRadiusByOne } from './Specials';

export const checkConditionsForUnitConstellationPlacement = (
  targetCoordinate: Coordinate,
  unitConstellation: TransformedConstellation,
  match: Match | undefined,
  activePlayer: Participant | undefined,
  map: Map | undefined,
  tilesWithUnits: TileWithUnit[] | undefined,
  tileLookup: TileLookup,
  ignoredRules: PlacementRuleName[],
  placingPlayer: Participant['id'] | undefined,
  specials: Special[],
) => {
  if (!match) {
    return { error: { message: 'Could not find match', statusCode: 400 } };
  }

  if (!map) {
    return { error: { message: 'Map is missing', statusCode: 500 } };
  }

  if (match.status !== MatchStatus.STARTED) {
    return { error: { message: 'Match is not started', statusCode: 400 } };
  }

  if (match.activePlayerId !== placingPlayer) {
    return { error: { message: "It's not your turn", statusCode: 400 } };
  }

  if (!tilesWithUnits) {
    return { error: { message: 'No tiles', statusCode: 400 } };
  }

  const targetTile = tileLookup[buildTileLookupId(targetCoordinate)];

  if (!targetTile) {
    return {
      error: { message: 'Could not find target tile', statusCode: 400 },
    };
  }

  const { coordinates, rotatedClockwise, mirrored } = unitConstellation;

  const transformedCoordinates = transformCoordinates(coordinates, {
    rotatedClockwise,
    mirrored,
  });

  const translatedCoordinates = translateCoordinatesTo(
    targetCoordinate,
    transformedCoordinates,
  );

  if (
    specials.some(
      (special) =>
        special.type === 'EXPAND_BUILD_RADIUS_BY_1' &&
        activePlayer &&
        activePlayer.bonusPoints + unitConstellation.value >=
          expandBuildRadiusByOne.cost,
    )
  ) {
    defaultGame.placementRuleMap.delete('ADJACENT_TO_ALLY');
    defaultGame.placementRuleMap.set(
      'ADJACENT_TO_ALLY_2',
      adjacentToAllyFactory(2),
    );
  }

  const canBePlaced = Array.from(defaultGame.placementRuleMap).every(
    ([ruleName, rule]) =>
      ignoredRules.includes(ruleName)
        ? true
        : rule(translatedCoordinates, map, tilesWithUnits, placingPlayer),
  );

  if (!canBePlaced) {
    return {
      error: {
        message: 'Cannot be placed due to a placement rule',
        statusCode: 400,
      },
    };
  }

  return { translatedCoordinates };
};
