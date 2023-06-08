import {
  coordinatesAreEqual,
  getAdjacentCoordinatesOfConstellation,
} from "coordinate-utils";
import { Participant, UnitType } from "database";
import { PlacementRule, TileWithUnit } from "types";

const isSomeTileWithAlly = (
  tiles: TileWithUnit[],
  playerId: Participant["id"]
) =>
  tiles.some(
    (tile) =>
      tile.unit?.ownerId === playerId ||
      tile.unit?.type === UnitType.MAIN_BUILDING
  );

const isSomeTileWithEnemy = (
  tiles: TileWithUnit[],
  playerId: Participant["id"]
) =>
  tiles.some(
    (tile) =>
      tile.unit &&
      (tile.unit.ownerId !== playerId ||
        tile.unit.type === UnitType.MAIN_BUILDING)
  );

const isSomeTileWithUnit = (tiles: TileWithUnit[]) =>
  tiles.some((tile) => tile.unit);

export const adjacentToUnitFactory: (
  buildRadius: 1 | 2 | 3,
  restrictTo: "ally" | "enemy" | "none"
) => PlacementRule = (buildRadius, restrictTo) => {
  return (constellation, _map, tileWithUnits, playerId) => {
    let adjacentCoordinates =
      getAdjacentCoordinatesOfConstellation(constellation);
    for (let index = 1; index < buildRadius; index++) {
      adjacentCoordinates = [
        ...adjacentCoordinates,
        ...getAdjacentCoordinatesOfConstellation(adjacentCoordinates),
      ];
    }

    const adjacentTiles = adjacentCoordinates
      .map((coordinate) =>
        tileWithUnits.find((tile) =>
          coordinatesAreEqual([tile.row, tile.col], coordinate)
        )
      )
      .filter((tile): tile is TileWithUnit => !!tile);

    if (restrictTo === "none") {
      return isSomeTileWithUnit(adjacentTiles);
    } else if (restrictTo === "ally") {
      return isSomeTileWithAlly(adjacentTiles, playerId);
    } else {
      return isSomeTileWithEnemy(adjacentTiles, playerId);
    }
  };
};
