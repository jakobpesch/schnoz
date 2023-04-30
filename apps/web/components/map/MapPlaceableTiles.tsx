import { Box } from "@chakra-ui/react"
import { Coordinate } from "types"
import { MapHighlights } from "./MapHighlights"

interface MapPlaceableTilesProps {
  placeableCoordinates: Coordinate[]
}
export const MapPlaceableTiles = (props: MapPlaceableTilesProps) => (
  <MapHighlights
    coordinates={props.placeableCoordinates}
    color={"transparent"}
    p="1"
    opacity={1}
  >
    <Box
      height="full"
      width="full"
      borderColor="whiteAlpha.700"
      bg="whiteAlpha.700"
      opacity={0.25}
    ></Box>
  </MapHighlights>
)
