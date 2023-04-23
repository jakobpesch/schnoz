import { Coordinate } from 'src/shared/types/coordinate.type';
import { TileWithUnit } from 'src/shared/types/database/tile-with-units.type';
import {
  addCoordinates,
  translateCoordinatesTo,
} from './constallationTransformer';

export const buildTileLookupId = (coordinate: Coordinate) => {
  return `${coordinate[0]}_${coordinate[1]}`;
};

export interface TileLookup {
  [tileId: string]: TileWithUnit;
}

export const getTileLookup = (tiles: TileWithUnit[]) => {
  return tiles.reduce<TileLookup>((acc, cur) => {
    return {
      ...acc,
      [buildTileLookupId([cur.row, cur.col])]: cur,
    };
  }, {});
};

export const getNewlyRevealedTiles = (
  tileLookup: TileLookup,
  translatedCoordinates: Coordinate[],
) => {
  const visionCircle = getCoordinateCircle(3);
  const tiles: TileWithUnit[] = [];

  for (let i = 0; i < translatedCoordinates.length; i++) {
    const translatedCoordinate = translatedCoordinates[i];
    const tile = tileLookup[buildTileLookupId(translatedCoordinate)];
    if (!tile) {
      return { error: { message: 'Error while placing', statusCode: 400 } };
    }
    const circleAroudUnit = translateCoordinatesTo(
      translatedCoordinate,
      visionCircle,
    );
    circleAroudUnit.forEach((coordinateInVision) => {
      const tile = tileLookup[buildTileLookupId(coordinateInVision)];
      if (tile && !tile.visible) {
        tile.visible = true;
        tiles.push(tile);
      }
    });
  }
  return { tiles };
};

export const getSquareMatrix = (radius: number) => {
  const range = Array.from(
    { length: 2 * radius + 1 },
    (v, index) => index - radius,
  );
  const squareMatrix: Coordinate[] = [];
  range.forEach((row) => range.forEach((col) => squareMatrix.push([row, col])));
  return squareMatrix;
};

export const getCoordinateCircle = (radius: number) => {
  const squareMatrix = getSquareMatrix(radius);
  return squareMatrix.filter(
    ([row, col]) => Math.sqrt(row ** 2 + col ** 2) <= radius + 0.5,
  );
};

export const coordinateIncludedIn = (
  coordinates: Coordinate[],
  coordinate: Coordinate,
) => coordinates.some((c) => coordinatesAreEqual(c, coordinate));

export const coordinatesAreEqual = (
  coordianteA: Coordinate,
  coordianteB: Coordinate,
) => coordianteA[0] === coordianteB[0] && coordianteA[1] === coordianteB[1];

export const coordinatesAreAdjacent = (
  coordinateA: Coordinate,
  coordinateB: Coordinate,
) => {
  const [rowA, colA] = coordinateA;
  const [rowB, colB] = coordinateB;
  return (
    (Math.abs(rowA - rowB) === 1 && Math.abs(colA - colB) === 0) ||
    (Math.abs(rowA - rowB) === 0 && Math.abs(colA - colB) === 1)
  );
};

export const getAdjacentCoordinates = (coordinate: Coordinate) => {
  const adjacentCoordinates = [
    addCoordinates(coordinate, [1, 0]),
    addCoordinates(coordinate, [0, 1]),
    addCoordinates(coordinate, [-1, 0]),
    addCoordinates(coordinate, [0, -1]),
  ];
  return adjacentCoordinates;
};
export const getDiagonallyAdjacentCoordinates = (coordinate: Coordinate) => {
  const adjacentCoordinates = [
    addCoordinates(coordinate, [1, 1]),
    addCoordinates(coordinate, [-1, 1]),
    addCoordinates(coordinate, [1, -1]),
    addCoordinates(coordinate, [-1, -1]),
  ];
  return adjacentCoordinates;
};

// export const getTopRightDiagonallyAdjacentCoordinates = (
//   coordinate: Coordinate
// ) => {
//   const adjacentCoordinates = [
//     addCoordinates(coordinate, [1, 1]),
//     addCoordinates(coordinate, [-1, -1]),
//   ]
//   return adjacentCoordinates
// }

// export const getTopLeftDiagonallyAdjacentCoordinates = (
//   coordinate: Coordinate
// ) => {
//   const adjacentCoordinates = [
//     addCoordinates(coordinate, [-1, 1]),
//     addCoordinates(coordinate, [1, -1]),
//   ]
//   return adjacentCoordinates
// }

export const getAdjacentCoordinatesOfConstellation = (
  constellation: Coordinate[],
) => {
  const adjacentOfConstellation = new Map<string, Coordinate>();

  constellation.forEach((coordinate) => {
    getAdjacentCoordinates(coordinate).forEach((adjacentCoordinate) => {
      if (!coordinateIncludedIn(constellation, adjacentCoordinate)) {
        adjacentOfConstellation.set(
          adjacentCoordinate.toString(),
          adjacentCoordinate,
        );
      }
    });
  });

  return [...adjacentOfConstellation.values()];
};
