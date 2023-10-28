import { useToken } from "@chakra-ui/react"
import { buildTileLookupId } from "coordinate-utils"
import { Coordinate } from "types"
import { HighlightCircle, LAYERS } from "../../pages/webgl"

interface MapRuleEvaluationsProps {
  coordinates: Coordinate[]
}
export const MapRuleEvaluations = (props: MapRuleEvaluationsProps) => {
  const color = useToken("colors", "teal.400")
  return props.coordinates.map(([row, col]) => (
    <HighlightCircle
      key={buildTileLookupId([row, col]) + "_placable"}
      position={[col, -row, LAYERS.UNITS_HIGHLIGHT]}
      scale={0.7}
      opacity={0.8}
      color={color}
    />
  ))
}
