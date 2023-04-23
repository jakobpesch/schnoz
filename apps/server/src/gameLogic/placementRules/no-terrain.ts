import { PlacementRule } from 'src/shared/types/placementRule/placement-rule.type';

export const noTerrain: PlacementRule = (constellation, map, tileWithUnits) => {
  const hasTerrain = constellation.some(
    ([row, col]) =>
      !!tileWithUnits.find((tile) => tile.row === row && tile.col === col)
        ?.terrain,
  );
  return !hasTerrain;
};
