import { TileWithUnit } from "./tile-with-units.type";

export interface TileLookup {
  [tileId: string]: TileWithUnit;
}
