import { Unit } from "database"
import { useMemo } from "react"
import { LAYERS } from "../../../pages/webgl"
import { useMaterial } from "../../../providers/MaterialProvider"
import { useMatchStore } from "../../../store"
import { UnitMesh } from "../meshes/UnitMesh"

export const UnitsLayer = () => {
  const { bobSpriteMaterial, ulfSpriteMaterial, mainBuildingSpriteMaterial } =
    useMaterial()

  const tilesWithUnits = useMatchStore((state) => state.tilesWithUnits)
  const participants = useMatchStore((state) => state.participants)

  const units = useMemo(
    () =>
      tilesWithUnits
        ?.filter((tile) => tile.unit)
        .map((tile) => tile.unit) as Unit[],
    [tilesWithUnits],
  )

  if (!tilesWithUnits || !participants) {
    return null
  }

  return (
    <>
      {units.map((unit) => {
        return (
          <UnitMesh
            key={unit.id}
            material={
              unit.ownerId === null
                ? mainBuildingSpriteMaterial
                : unit.ownerId === participants[0].id
                ? bobSpriteMaterial
                : ulfSpriteMaterial
            }
            position={[unit.col, -unit.row, LAYERS.UNITS]}
          />
        )
      })}
    </>
  )
}
