import { PlacementRule } from 'src/shared/types/placementRule/placement-rule.type';

export const noUnit: PlacementRule = (constellation, map, tileWithUnits) => {
  const hasUnit = constellation.some(
    ([row, col]) =>
      !!tileWithUnits.find((tile) => tile.row === row && tile.col === col)
        ?.unit,
  );
  return !hasUnit;
};
