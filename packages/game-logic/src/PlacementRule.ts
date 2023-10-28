import {
  buildTileLookupId,
  transformCoordinates,
  translateCoordinatesTo,
} from "coordinate-utils"
import { GameSettings, Map, Match, MatchStatus, Participant } from "database"
import {
  API_ERROR_CODES,
  Coordinate,
  ParticipantWithUser,
  PlacementRuleName,
  Special,
  TileLookup,
  TileWithUnit,
  TransformedConstellation,
} from "types"
import { createCustomGame } from "./GameVariants"
enum ReadableRuleNames {
  NO_UNIT = "cannot be placed on a unit",
  ADJACENT_TO_ALLY = "must be within a 1 tile radius from an ally",
  ADJACENT_TO_ALLY_2 = "must be within a 2 tile radius from an ally",
  ADJACENT_TO_ENEMY = "must be within a 1 tile radius from an enemy",
  ADJACENT_TO_ENEMY_2 = "must be within a 2 tile radius from an enemy",
  ADJACENT_TO_UNIT = "must be within a 1 tile radius from a unit",
  ADJACENT_TO_UNIT_2 = "must be within a 2 tile radius from a unit",
  NO_TERRAIN = "cannot be placed on terrain",
  IN_BOUNDS = "cannot be placed out of bounds",
}

export const checkConditionsForUnitConstellationPlacement = (
  targetCoordinate: Coordinate,
  unitConstellation: TransformedConstellation,
  match: Match | null,
  activePlayer: ParticipantWithUser | null,
  map: Map | null,
  tilesWithUnits: TileWithUnit[] | null,
  ignoredRules: PlacementRuleName[],
  placingPlayer: Participant["id"] | null,
  specials: Special[],
  gameSettings: GameSettings | null,
  tileLookup: TileLookup,
) => {
  // console.log("checkConditionsForUnitConstellationPlacement", targetCoordinate)

  if (!match) {
    return {
      error: {
        errorCode: API_ERROR_CODES.MATCH_NOT_FOUND,
        message: "Could not find match",
        statusCode: 400,
      },
    }
  }

  if (!map) {
    return {
      error: {
        errorCode: API_ERROR_CODES.MAP_NOT_FOUND,
        message: "Map is missing",
        statusCode: 500,
      },
    }
  }

  if (match.status !== MatchStatus.STARTED) {
    return {
      error: {
        errorCode: API_ERROR_CODES.MATCH_NOT_STARTED,
        message: "Match is not started",
        statusCode: 400,
      },
    }
  }

  if (!placingPlayer) {
    return {
      error: {
        errorCode: API_ERROR_CODES.NO_PLACING_PLAYER,
        message: "No placing player",
        statusCode: 400,
      },
    }
  }

  if (match.activePlayerId !== placingPlayer) {
    return {
      error: {
        errorCode: API_ERROR_CODES.NOT_YOUR_TURN,
        message: "It's not your turn",
        statusCode: 400,
      },
    }
  }

  if (!tilesWithUnits) {
    return {
      error: {
        errorCode: API_ERROR_CODES.TILES_NOT_FOUND,
        message: "No tiles",
        statusCode: 400,
      },
    }
  }
  if (!gameSettings) {
    return {
      error: {
        errorCode: API_ERROR_CODES.GAME_SETTINGS_NOT_FOUND,
        message: "No gamesettings",
        statusCode: 400,
      },
    }
  }

  const targetTile = tileLookup[buildTileLookupId(targetCoordinate)]

  if (!targetTile) {
    return {
      error: {
        errorCode: API_ERROR_CODES.TILE_NOT_FOUND,
        message: "Could not find target tile",
        statusCode: 400,
      },
    }
  }

  const { coordinates, rotatedClockwise, mirrored } = unitConstellation

  const transformedCoordinates = transformCoordinates(coordinates, {
    rotatedClockwise,
    mirrored,
  })

  const translatedCoordinates = translateCoordinatesTo(
    targetCoordinate,
    transformedCoordinates,
  )

  const placementRuleMap = createCustomGame(gameSettings).placementRuleMap

  // if (
  //   specials.some(
  //     (special) =>
  //       special.type === "EXPAND_BUILD_RADIUS_BY_1" &&
  //       activePlayer &&
  //       activePlayer.bonusPoints + unitConstellation.value >=
  //         expandBuildRadiusByOne.cost,
  //   )
  // ) {
  //   delete placementRuleMap.ADJACENT_TO_ALLY
  //   placementRuleMap.set("ADJACENT_TO_ALLY_2", adjacentToUnitFactory(2, "ally"))
  // }

  const evaluatedRules = Object.entries(placementRuleMap).map((entries) => {
    const ruleName = entries[0] as PlacementRuleName
    const rule = entries[1]
    return {
      ruleName,
      isFulfilled: ignoredRules.includes(ruleName as PlacementRuleName)
        ? true
        : rule(translatedCoordinates, map, tilesWithUnits, placingPlayer),
    }
  })

  const canBePlaced = evaluatedRules.every(
    (ruleEvaluation) => ruleEvaluation.isFulfilled,
  )

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
    }
  }

  return { translatedCoordinates }
}
