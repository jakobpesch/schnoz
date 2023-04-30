import { PlacementRule } from "types";

export const noUnit: PlacementRule = (constellation, map, tileWithUnits) => {
  const hasUnit = constellation.some(
    ([row, col]) =>
      !!tileWithUnits.find((tile) => tile.row === row && tile.col === col)?.unit
  );
  return !hasUnit;
};
