import { Box, useToken } from "@chakra-ui/react"
import { Coordinate } from "types"
import { MapHighlights } from "./MapHighlights"
import { HighlightMesh, LAYERS } from "../../pages/webgl"
import { buildTileLookupId } from "coordinate-utils"
import { useFrame } from "@react-three/fiber"

interface PlaceableTilesProps {
  placeableCoordinates: Coordinate[]
}
export const PlaceableTiles = (props: PlaceableTilesProps) => {
  const color = useToken("colors", "teal.400")
  return props.placeableCoordinates.map(([row, col]) => (
    <HighlightMesh
      key={buildTileLookupId([row, col]) + "_placable"}
      position={[col, -row, LAYERS.TERRAIN_HIGHLIGHT]}
      scale={0.7}
      opacity={0.8}
      color={color}
    />
  ))
}
