import { Map as SchnozMap, UnitType } from "database"
import { Coordinate2D } from "../models/UnitConstellation.model"
import { TileWithUnit } from "../types/Tile"
import {
  coordinatesAreEqual,
  getAdjacentCoordinatesOfConstellation,
} from "../utils/coordinateUtils"

export const inBounds: PlacementRule = (constellation, map) =>
  constellation.every(
    ([row, col]) =>
      row >= 0 && col >= 0 && row < map.rowCount && col < map.colCount
  )

export type PlacementRule = (
  constellation: Coordinate2D[],
  // @todo consider replaceing with tile lookup
  map: SchnozMap,
  tilesWithUnits: TileWithUnit[],
  playerId: string
) => boolean
export const noUnit: PlacementRule = (constellation, map, tilesWithUnits) => {
  const hasUnit = constellation.some(
    ([row, col]) =>
      !!tilesWithUnits.find((tile) => tile.row === row && tile.col === col)
        ?.unit
  )
  return !hasUnit
}

export const noTerrain: PlacementRule = (
  constellation,
  map,
  tilesWithUnits
) => {
  const hasTerrain = constellation.some(
    ([row, col]) =>
      !!tilesWithUnits.find((tile) => tile.row === row && tile.col === col)
        ?.terrain
  )
  return !hasTerrain
}

export const adjacentToAlly: PlacementRule = (
  constellation,
  map,
  tilesWithUnits,
  playerId
) => {
  const adjacentCoordinates =
    getAdjacentCoordinatesOfConstellation(constellation)

  const adjacentTiles = adjacentCoordinates
    .map((coordinate) =>
      tilesWithUnits.find((tile) =>
        coordinatesAreEqual([tile.row, tile.col], coordinate)
      )
    )
    .filter((tile): tile is TileWithUnit => !!tile)

  const isAdjacentToAlly = adjacentTiles.some(
    (tile) =>
      tile.unit?.ownerId === playerId ||
      tile.unit?.type === UnitType.MAIN_BUILDING
  )
  return isAdjacentToAlly
}

export const adjacentToAlly2: PlacementRule = (
  constellation,
  map,
  tilesWithUnits,
  playerId
) => {
  let adjacentCoordinates = getAdjacentCoordinatesOfConstellation(constellation)
  adjacentCoordinates = [
    ...adjacentCoordinates,
    ...getAdjacentCoordinatesOfConstellation(adjacentCoordinates),
  ]
  const adjacentTiles2 = adjacentCoordinates
    .map((coordinate) =>
      tilesWithUnits.find((tile) =>
        coordinatesAreEqual([tile.row, tile.col], coordinate)
      )
    )
    .filter((tile): tile is TileWithUnit => !!tile)

  const isAdjacentToAlly2 = adjacentTiles2.some(
    (tile) =>
      tile.unit?.ownerId === playerId ||
      tile.unit?.type === UnitType.MAIN_BUILDING
  )
  return isAdjacentToAlly2
}

export type PlacementRuleName =
  | "NO_UNIT"
  | "ADJACENT_TO_ALLY"
  | "ADJACENT_TO_ALLY_2"
  | "NO_TERRAIN"
  | "IN_BOUNDS"

export const placementRulesMap = new Map<PlacementRuleName, PlacementRule>([
  ["NO_UNIT", noUnit],
  ["ADJACENT_TO_ALLY", adjacentToAlly],
  ["ADJACENT_TO_ALLY_2", adjacentToAlly2],
  ["NO_TERRAIN", noTerrain],
  ["IN_BOUNDS", inBounds],
])

export type PlacementRuleMap = typeof placementRulesMap
