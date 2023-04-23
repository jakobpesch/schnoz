import {
  buildTileLookupId,
  transformCoordinates,
  translateCoordinatesTo,
} from "coordinate-utils";
import { Map, Match, MatchStatus, Participant } from "database";
import {
  Coordinate,
  PlacementRuleName,
  Special,
  TileWithUnit,
  TileLookup,
  TransformedConstellation,
} from "types";
import { defaultGame } from "./GameVariants";
import { expandBuildRadiusByOne } from "./Specials";
import { adjacentToAllyFactory } from "./placementRules/adjacent-to-ally";

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
  if (!match) {
    return { error: { message: "Could not find match", statusCode: 400 } };
  }

  if (!map) {
    return { error: { message: "Map is missing", statusCode: 500 } };
  }

  if (match.status !== MatchStatus.STARTED) {
    return { error: { message: "Match is not started", statusCode: 400 } };
  }

  if (match.activePlayerId !== placingPlayer) {
    return { error: { message: "It's not your turn", statusCode: 400 } };
  }

  if (!tilesWithUnits) {
    return { error: { message: "No tiles", statusCode: 400 } };
  }

  const targetTile = tileLookup[buildTileLookupId(targetCoordinate)];

  if (!targetTile) {
    return {
      error: { message: "Could not find target tile", statusCode: 400 },
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
      adjacentToAllyFactory(2)
    );
  }

  const canBePlaced = Array.from(defaultGame.placementRuleMap).every(
    ([ruleName, rule]) =>
      ignoredRules.includes(ruleName)
        ? true
        : rule(translatedCoordinates, map, tilesWithUnits, placingPlayer)
  );

  if (!canBePlaced) {
    return {
      error: {
        message: "Cannot be placed due to a placement rule",
        statusCode: 400,
      },
    };
  }

  return { translatedCoordinates };
};
