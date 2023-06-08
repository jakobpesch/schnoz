import {
  buildTileLookupId,
  transformCoordinates,
  translateCoordinatesTo,
} from "coordinate-utils";
import { Map, Match, MatchStatus, Participant } from "database";
import {
  API_ERROR_CODES,
  Coordinate,
  PlacementRuleName,
  Special,
  TileLookup,
  TileWithUnit,
  TransformedConstellation,
} from "types";
import { defaultGame } from "./GameVariants";
import { expandBuildRadiusByOne } from "./Specials";
import { adjacentToUnitFactory } from "./placementRules/adjacent-to-ally";
enum ReadableRuleNames {
  NO_UNIT = "cannot be placed on a unit",
  ADJACENT_TO_ALLY = "must be within a 1 tile radius from an ally",
  ADJACENT_TO_ALLY_2 = "must be within a 2 tile radius from an ally",
  ADJACENT_TO_ENEMY = "must be within a 1 tile radius from an enemy",
  ADJACENT_TO_ENEMY_2 = "must be within a 2 tile radius from an enemy",
  NO_TERRAIN = "cannot be placed on terrain",
  IN_BOUNDS = "cannot be placed out of bounds",
}

export const checkConditionsForUnitConstellationPlacement = (
  targetCoordinate: Coordinate,
  unitConstellation: TransformedConstellation,
  match: Match | undefined,
  activePlayer: Participant | undefined,
  map: Map | undefined,
  tilesWithUnits: TileWithUnit[] | undefined,
  tileLookup: TileLookup,
  ignoredRules: PlacementRuleName[],
  placingPlayer: Participant["id"] | undefined,
  specials: Special[]
) => {
  console.log(JSON.stringify(Array.from(defaultGame.placementRuleMap.keys())));
  if (!match) {
    return {
      error: {
        errorCode: API_ERROR_CODES.MATCH_NOT_FOUND,
        message: "Could not find match",
        statusCode: 400,
      },
    };
  }

  if (!map) {
    return {
      error: {
        errorCode: API_ERROR_CODES.MAP_NOT_FOUND,
        message: "Map is missing",
        statusCode: 500,
      },
    };
  }

  if (match.status !== MatchStatus.STARTED) {
    return {
      error: {
        errorCode: API_ERROR_CODES.MATCH_NOT_STARTED,
        message: "Match is not started",
        statusCode: 400,
      },
    };
  }

  if (match.activePlayerId !== placingPlayer) {
    return {
      error: {
        errorCode: API_ERROR_CODES.NOT_YOUR_TURN,
        message: "It's not your turn",
        statusCode: 400,
      },
    };
  }

  if (!tilesWithUnits) {
    return {
      error: {
        errorCode: API_ERROR_CODES.TILES_NOT_FOUND,
        message: "No tiles",
        statusCode: 400,
      },
    };
  }

  const targetTile = tileLookup[buildTileLookupId(targetCoordinate)];

  if (!targetTile) {
    return {
      error: {
        errorCode: API_ERROR_CODES.TILE_NOT_FOUND,
        message: "Could not find target tile",
        statusCode: 400,
      },
    };
  }

  const { coordinates, rotatedClockwise, mirrored } = unitConstellation;

  const transformedCoordinates = transformCoordinates(coordinates, {
    rotatedClockwise,
    mirrored,
  });

  const translatedCoordinates = translateCoordinatesTo(
    targetCoordinate,
    transformedCoordinates
  );

  if (
    specials.some(
      (special) =>
        special.type === "EXPAND_BUILD_RADIUS_BY_1" &&
        activePlayer &&
        activePlayer.bonusPoints + unitConstellation.value >=
          expandBuildRadiusByOne.cost
    )
  ) {
    defaultGame.placementRuleMap.delete("ADJACENT_TO_ALLY");
    defaultGame.placementRuleMap.set(
      "ADJACENT_TO_ALLY_2",
      adjacentToUnitFactory(2, "ally")
    );
  }

  const evaluatedRules = Array.from(defaultGame.placementRuleMap).map(
    ([ruleName, rule]) => ({
      ruleName,
      isFulfilled: ignoredRules.includes(ruleName)
        ? true
        : rule(translatedCoordinates, map, tilesWithUnits, placingPlayer),
    })
  );

  const canBePlaced = evaluatedRules.every(
    (ruleEvaluation) => ruleEvaluation.isFulfilled
  );

  if (!canBePlaced) {
    return {
      error: {
        errorCode: API_ERROR_CODES.CANNOT_BE_PLACED,
        message: evaluatedRules
          .filter((evaluatedRule) => !evaluatedRule.isFulfilled)
          .map((evaluatedRule) => ReadableRuleNames[evaluatedRule.ruleName])
          .join(" and "),
        statusCode: 400,
      },
    };
  }

  return { translatedCoordinates };
};
