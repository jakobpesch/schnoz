import { Map } from "database"
import { Coordinate } from "../coordinate.type"
import { TileWithUnit } from "../tile-with-units.type"

export type PlacementRule = (
  constellation: Coordinate[],
  // @todo consider replaceing with tile lookup
  map: Map,
  tilesWithunits: TileWithUnit[],
  playerId: string,
) => boolean
