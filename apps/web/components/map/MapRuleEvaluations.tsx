import { Coordinate } from "types"
import { MapHighlights } from "./MapHighlights"

interface MapRuleEvaluationsProps {
  coordinates: Coordinate[]
}
export const MapRuleEvaluations = (props: MapRuleEvaluationsProps) => (
  <MapHighlights coordinates={props.coordinates} color={"pink.700"} />
)
