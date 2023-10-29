import { buildTileLookupId } from "coordinate-utils"
import { useMatchStore } from "../../../store"
import { TerrainMesh } from "../meshes/TerrainMesh"
import { LAYERS } from "../../../pages/webgl"

export const TerrainsLayer = () => {
  const tilesWithUnits = useMatchStore((state) => state.tilesWithUnits)
  if (!tilesWithUnits) {
    return null
  }
  return (
    <>
      {tilesWithUnits
        .filter((tile) => tile.terrain)
        .map((tile) => {
          return (
            <TerrainMesh
              key={buildTileLookupId([tile.row, tile.col])}
              tile={tile}
              position={[tile.col, -tile.row, LAYERS.TERRAIN]}
            />
          )
        })}
    </>
  )
}
