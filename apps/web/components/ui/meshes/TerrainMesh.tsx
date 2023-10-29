import { ThreeElements } from "@react-three/fiber"
import { Tile } from "database"
import { useMaterial } from "../../../providers/MaterialProvider"

export const StoneMesh = (props: ThreeElements["mesh"]) => {
  const { stoneMaterial, stoneGeometry } = useMaterial()
  return <mesh material={stoneMaterial} geometry={stoneGeometry} {...props} />
}

export const TreeMesh = (props: ThreeElements["mesh"]) => {
  const { treeMaterial, treeGeometry } = useMaterial()
  return (
    <mesh
      rotation={[0, 0, Math.PI / 5]}
      material={treeMaterial}
      geometry={treeGeometry}
      {...props}
    />
  )
}

export const WaterMesh = (props: ThreeElements["mesh"]) => {
  const { waterMaterial, waterGeometry } = useMaterial()
  return <mesh material={waterMaterial} geometry={waterGeometry} {...props} />
}

export const TerrainMesh = (props: ThreeElements["mesh"] & { tile: Tile }) => {
  const { tile, ...rest } = props
  if (tile.terrain === "STONE") {
    return <StoneMesh {...rest} />
  }
  if (tile.terrain === "TREE") {
    return <TreeMesh {...rest} />
  }
  if (tile.terrain === "WATER") {
    return <WaterMesh {...rest} />
  }
}
