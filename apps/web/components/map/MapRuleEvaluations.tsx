import { useToken } from "@chakra-ui/react"
import { buildTileLookupId } from "coordinate-utils"
import { Coordinate } from "types"
import { LAYERS } from "../../pages/webgl"
import { PlaceableHighlightMesh } from "../ui/meshes/PlaceableHighlightMesh"

interface MapRuleEvaluationsProps {
  coordinates: Coordinate[]
}
export const MapRuleEvaluations = (props: MapRuleEvaluationsProps) => {
  const color = useToken("colors", "red.100")
  return props.coordinates.map(([row, col]) => (
    <PlaceableHighlightMesh
      key={buildTileLookupId([row, col]) + "_placable"}
      position={[col, -row, LAYERS.UNITS_HIGHLIGHT]}
      width={1}
      height={1}
      color={color}
    />
  ))
}
