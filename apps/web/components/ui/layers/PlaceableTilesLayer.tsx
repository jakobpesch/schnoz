import { buildTileLookupId } from "coordinate-utils"
import { LAYERS } from "../../../pages/webgl"
import { useMatchStore } from "../../../store"
import { PlaceableHighlightMesh } from "../meshes/PlaceableHighlightMesh"

export const PlaceableTilesLayer = () => {
  const placeableCoordinates = useMatchStore(
    (state) => state.placeableCoordinates,
  )
  return placeableCoordinates?.map(([row, col]) => (
    <PlaceableHighlightMesh
      key={buildTileLookupId([row, col]) + "_placable"}
      position={[col, -row, LAYERS.TERRAIN_HIGHLIGHT]}
    />
  ))
}
