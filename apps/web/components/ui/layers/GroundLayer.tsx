import { LAYERS } from "../../../pages/webgl"
import { useMatchStore } from "../../../store"

export const GroundLayer = () => {
  const map = useMatchStore((state) => state.map)
  if (!map) {
    return
  }
  return (
    <mesh
      position={[
        map.rowCount / 2 - 0.5,
        -(map.colCount / 2 - 0.5),
        LAYERS.BASE,
      ]}
    >
      <planeGeometry args={[map?.colCount, map?.rowCount]} />
      <meshStandardMaterial color={"#748E63"} />
    </mesh>
  )
}
