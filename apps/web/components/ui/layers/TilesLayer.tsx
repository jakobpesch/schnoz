import { GroupProps } from "@react-three/fiber"
import { buildTileLookupId, coordinatesAreEqual } from "coordinate-utils"
import { useEffect, useMemo } from "react"
import { LAYERS } from "../../../pages/webgl"
import {
  setHoveredCoordinate,
  setTilesWithUnits,
  useMatchStore,
} from "../../../store"
import { TileMesh } from "../meshes/TileMesh"
import { Tile } from "database"

export const TilesLayer = (props: GroupProps) => {
  console.log("render tiles")

  const map = useMatchStore((state) => state.map)
  const tilesWithUnits = useMatchStore((state) => state.tilesWithUnits)

  const tiles = useMemo(() => {
    if (!map) {
      return []
    }
    const tiles = []
    for (let row = 0; row < map?.rowCount; row++) {
      for (let col = 0; col < map?.colCount; col++) {
        tiles.push({ row, col } as Tile)
      }
    }
    return tiles
  }, [map?.colCount, map?.rowCount])

  const updatedTilesWithUnits = useMatchStore(
    (state) => state.updatedTilesWithUnits,
  )
  useEffect(() => {
    if (!updatedTilesWithUnits || !tilesWithUnits) {
      return
    }
    const tilesWithUnitsClone = [...tilesWithUnits]

    updatedTilesWithUnits.forEach((updatedTileWithUnit) => {
      const index = tilesWithUnits.findIndex((t) =>
        coordinatesAreEqual(
          [t.row, t.col],
          [updatedTileWithUnit.row, updatedTileWithUnit.col],
        ),
      )
      if (index === -1) {
        tilesWithUnitsClone.push(updatedTileWithUnit)
        return
      }
      tilesWithUnitsClone[index] = updatedTileWithUnit
    })

    setTilesWithUnits(tilesWithUnitsClone)
  }, [updatedTilesWithUnits])

  return (
    <group {...props} onPointerLeave={() => setHoveredCoordinate(null)}>
      {tiles.map((tile) => {
        return (
          <TileMesh
            key={buildTileLookupId([tile.row, tile.col])}
            tile={tile}
            position={[tile.col, -tile.row, LAYERS.TILE]}
            onPointerEnter={() => {
              setHoveredCoordinate([tile.row, tile.col])
            }}
          />
        )
      })}
    </group>
  )
}
