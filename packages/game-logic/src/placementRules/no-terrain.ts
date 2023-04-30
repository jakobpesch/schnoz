import { PlacementRule } from "types";

export const noTerrain: PlacementRule = (constellation, map, tileWithUnits) => {
  const hasTerrain = constellation.some(
    ([row, col]) =>
      !!tileWithUnits.find((tile) => tile.row === row && tile.col === col)
        ?.terrain
  );
  return !hasTerrain;
};
