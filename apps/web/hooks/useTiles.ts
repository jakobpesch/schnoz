import { useMemo } from "react"
import { Coordinate } from "types"
import { TileWithUnit } from "types"
import {
  buildTileLookupId,
  getAdjacentCoordinates,
  getTileLookup,
} from "coordinate-utils"

export function useTiles(tilesWithUnits: TileWithUnit[] | null) {
  const tileLookup =
    useMemo(() => {
      return getTileLookup(tilesWithUnits ?? [])
    }, [tilesWithUnits]) ?? []

  const terrainTiles =
    useMemo(() => {
      return tilesWithUnits?.filter((tile) => tile.terrain && tile.visible)
    }, [tilesWithUnits]) ?? []

  const unitTiles =
    useMemo(() => {
      return tilesWithUnits?.filter((tile) => tile.unit && tile.visible)
    }, [tilesWithUnits]) ?? []

  const fogTiles =
    useMemo(() => {
      return tilesWithUnits?.filter((tile) => !tile.visible)
    }, [tilesWithUnits]) ?? []

  const halfFogTiles =
    useMemo(() => {
      return tilesWithUnits?.filter((tile) => {
        if (!tile.visible) {
          return false
        }
        const coordinate: Coordinate = [tile.row, tile.col]
        const adjacentCoordinates = getAdjacentCoordinates(coordinate)
        const hasHiddenAdjacentTile = adjacentCoordinates.some(
          (adjacentCoordinate) => {
            const tile = tileLookup[buildTileLookupId(adjacentCoordinate)]
            if (!tile) {
              return false
            }
            return !tile.visible
          },
        )
        return tile.visible && hasHiddenAdjacentTile
      })
    }, [tilesWithUnits]) ?? []

  return {
    tileLookup,
    terrainTiles,
    unitTiles,
    fogTiles,
    halfFogTiles,
  }
}
