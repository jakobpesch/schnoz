import { PlacementRule } from 'src/shared/types/placementRule/placement-rule.type';

export const inBounds: PlacementRule = (constellation, map) =>
  constellation.every(
    ([row, col]) =>
      row >= 0 && col >= 0 && row < map.rowCount && col < map.colCount,
  );
