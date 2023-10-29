import { Mask, useMask } from "@react-three/drei"
import { buildTileLookupId } from "coordinate-utils"
import { LAYERS } from "../../../pages/webgl"
import { useMatchStore } from "../../../store"

export const FogLayer = () => {
  const map = useMatchStore((state) => state.map)
  const tilesWithUnits = useMatchStore((state) => state.tilesWithUnits)
  const stencil = useMask(1, true)

  if (!map || !tilesWithUnits) {
    return
  }
  return (
    <>
      {tilesWithUnits?.map((tile) => (
        <Mask
          id={1}
          // colorWrite={colorWrite}
          // depthWrite={depthWrite}
          key={buildTileLookupId([tile.row, tile.col])}
          position={[tile.col, -tile.row, 1]}
        >
          <planeGeometry args={[1, 1]} />
        </Mask>
      ))}
      <mesh
        position={[
          map.colCount / 2 - 0.5,
          -(map.rowCount / 2 - 0.5),
          LAYERS.FOG,
        ]}
      >
        <planeGeometry args={[map.colCount, map.rowCount]} />
        <meshStandardMaterial {...stencil} color={"black"} />
      </mesh>
    </>
  )
}
