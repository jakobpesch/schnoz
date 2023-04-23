import { Participant, Rule, Terrain, UnitType } from 'database';
import { Coordinate } from 'src/shared/types/coordinate.type';
import { RuleEvaluation } from 'src/shared/types/rule-evaluation.interface';
import { ScoringRule } from 'src/shared/types/scoring-rule.type';
import { addCoordinates } from '../utils/constallationTransformer';
import {
  buildTileLookupId,
  coordinatesAreEqual,
  getAdjacentCoordinates,
  TileLookup,
} from '../utils/coordinateUtils';

const buildTerrainRule: (options: {
  terrain: Terrain;
  penalty?: boolean;
  ruleType: Rule;
}) => ScoringRule =
  (options: { terrain: Terrain; penalty?: boolean; ruleType: Rule }) =>
  (playerId, tileLookup) => {
    const { terrain, penalty, ruleType } = options;

    const ruleEvaluation: RuleEvaluation = {
      playerId,
      type: ruleType,
      points: 0,
      fulfillments: [],
    };

    const point = penalty ? -1 : 1;

    const terrainTiles = Object.values(tileLookup).filter(
      (tile) => tile.terrain === terrain && tile.visible,
    );

    terrainTiles.forEach((terrainTile) => {
      const terrainCoordinate: Coordinate = [terrainTile.row, terrainTile.col];
      const adjacentCoordinates = getAdjacentCoordinates(terrainCoordinate);
      const hasUnitAdjacentToTerrainTile = adjacentCoordinates.some(
        (coordinate) =>
          tileLookup[buildTileLookupId(coordinate)]?.unit?.ownerId === playerId,
      );
      if (hasUnitAdjacentToTerrainTile) {
        ruleEvaluation.fulfillments.push([terrainCoordinate]);
        ruleEvaluation.points += point;
      }
    }, 0);

    return ruleEvaluation;
  };

export const waterRule: ScoringRule = buildTerrainRule({
  terrain: Terrain.WATER,
  ruleType: 'TERRAIN_WATER_POSITIVE',
});

export const stoneRule: ScoringRule = buildTerrainRule({
  terrain: Terrain.STONE,
  penalty: true,
  ruleType: 'TERRAIN_STONE_NEGATIVE',
});

export const holeRule: ScoringRule = (playerId, tileLookup) => {
  const ruleEvaluation: RuleEvaluation = {
    playerId,
    type: 'HOLE',
    points: 0,
    fulfillments: [],
  };
  const potentialHolesTiles = Object.values(tileLookup).filter(
    (tile) => tile.visible && !tile.unit && !tile.terrain,
  );

  potentialHolesTiles.forEach((potentialHoleTile) => {
    const potentialHoleCoordinate: Coordinate = [
      potentialHoleTile.row,
      potentialHoleTile.col,
    ];

    const adjacentCoordinatesToPotentialHole = getAdjacentCoordinates(
      potentialHoleCoordinate,
    );

    const adjacentTiles = adjacentCoordinatesToPotentialHole
      .map((coordinate) => tileLookup[buildTileLookupId(coordinate)] ?? null)
      .filter((tile) => !!tile);

    const allAlly =
      adjacentTiles.every((tile) => {
        const isAlly =
          tile.unit?.ownerId === playerId ||
          tile.unit?.type === UnitType.MAIN_BUILDING;
        const hasTerrain = !!tile.terrain;
        return isAlly || hasTerrain;
      }) && adjacentTiles.some((tile) => tile.unit?.ownerId === playerId);

    if (allAlly) {
      ruleEvaluation.fulfillments.push([potentialHoleCoordinate]);
      ruleEvaluation.points += 1;
    }
  }, 0);

  return ruleEvaluation;
};

export const diagnoalRule: ScoringRule = (playerId, tileLookup) => {
  const ruleEvaluation: RuleEvaluation = {
    playerId,
    type: 'DIAGONAL_NORTHEAST',
    points: 0,
    fulfillments: [],
  };
  const tiles = Object.values(tileLookup);
  const maxSize = Math.sqrt(tiles.length);
  const unitTiles = tiles.filter((tile) => tile.unit?.ownerId === playerId);

  const processedTileIds = new Set<string>();
  unitTiles.forEach((unitTile) => {
    const startCoordinate: Coordinate = [unitTile.row, unitTile.col];
    if (processedTileIds.has(buildTileLookupId(startCoordinate))) {
      return;
    }
    processedTileIds.add(buildTileLookupId(startCoordinate));

    const fulfillment: RuleEvaluation['fulfillments'][0] = [
      [...startCoordinate],
    ];

    const topRightStep: Coordinate = [1, -1];
    const bottomLeftStep: Coordinate = [-1, 1];
    const directions = [topRightStep, bottomLeftStep];

    directions.forEach((direction) => {
      let currentCoordinate: Coordinate = [...startCoordinate];
      const inBounds = currentCoordinate.every(
        (value) => value >= 0 && value < maxSize,
      );
      while (inBounds) {
        const topRightCoordinate = addCoordinates(currentCoordinate, direction);
        const topRightTile = tileLookup[buildTileLookupId(topRightCoordinate)];

        if (!topRightTile) {
          break;
        }

        const topRightUnitTile = unitTiles.find((unitTile) =>
          coordinatesAreEqual(
            [topRightTile.row, topRightTile.col],
            [unitTile.row, unitTile.col],
          ),
        );
        const topRightIsPlayersUnit =
          !topRightUnitTile ||
          !topRightUnitTile.unit ||
          topRightUnitTile.unit.ownerId !== playerId;

        if (topRightIsPlayersUnit) {
          break;
        }

        processedTileIds.add(
          buildTileLookupId([topRightUnitTile.row, topRightUnitTile.col]),
        );
        fulfillment.push(topRightCoordinate);
        currentCoordinate = [...topRightCoordinate];
      }
    });
    if (fulfillment.length >= 3) {
      ruleEvaluation.fulfillments.push(fulfillment);
    }
  });
  ruleEvaluation.points = ruleEvaluation.fulfillments.length;
  return ruleEvaluation;
};

export const ScoringRulesMap = new Map<Rule, ScoringRule>([
  ['TERRAIN_WATER_POSITIVE', waterRule],
  ['TERRAIN_STONE_NEGATIVE', stoneRule],
  ['HOLE', holeRule],
  ['DIAGONAL_NORTHEAST', diagnoalRule],
]);
