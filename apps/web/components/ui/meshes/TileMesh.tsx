import { ThreeElements } from "@react-three/fiber"
import { Tile } from "database"
import { useRef } from "react"
import { useMaterial } from "../../../providers/MaterialProvider"

export const TileMesh = (
  props: ThreeElements["mesh"] & {
    tile: Tile
  },
) => {
  const {
    tilePlaneGeometry: tileGeometry,
    tileMeshMaterial: tileMaterial,
    tileZeroOpacityMeshMaterial: tileZeroOpacityMaterial,
  } = useMaterial()
  const { tile, ...rest } = props
  const ref = useRef<THREE.Mesh>(null!)
  return (
    <mesh
      ref={ref}
      material={
        (tile.row + tile.col) % 2 === 0 ? tileMaterial : tileZeroOpacityMaterial
      }
      geometry={tileGeometry}
      {...rest}
    />
  )
}
