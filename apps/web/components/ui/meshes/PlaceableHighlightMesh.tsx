import { ThreeElements } from "@react-three/fiber"
import { useMaterial } from "../../../providers/MaterialProvider"

export const PlaceableHighlightMesh = (props: ThreeElements["mesh"]) => {
  const { placeableHighlightGeometry, placeableHighlightMaterial } =
    useMaterial()
  return (
    <mesh
      geometry={placeableHighlightGeometry}
      material={placeableHighlightMaterial}
      {...props}
    />
  )
}
