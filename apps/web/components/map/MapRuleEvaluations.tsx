import { Coordinate2D } from "../../models/UnitConstellation.model"
import { MapHighlights } from "./MapHighlights"

interface MapRuleEvaluationsProps {
  coordinates: Coordinate2D[]
}
export const MapRuleEvaluations = (props: MapRuleEvaluationsProps) => (
  <MapHighlights coordinates={props.coordinates} color={"pink.700"} />
)
