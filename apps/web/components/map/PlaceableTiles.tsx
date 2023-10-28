import { useToken } from "@chakra-ui/react"
import { buildTileLookupId } from "coordinate-utils"
import { HighlightCircle, LAYERS } from "../../pages/webgl"
import { useMatchStore } from "../../store"

export const PlaceableTiles = () => {
  const placeableCoordinates = useMatchStore(
    (state) => state.placeableCoordinates,
  )
  return placeableCoordinates?.map(([row, col]) => (
    <HighlightCircle
      key={buildTileLookupId([row, col]) + "_placable"}
      position={[col, -row, LAYERS.TERRAIN_HIGHLIGHT + 0.2]}
      scale={0.7}
      color={"#FFD700"}
    />
  ))
}
