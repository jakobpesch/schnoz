import { Box, BoxProps, Center } from "@chakra-ui/react"
import { Map } from "database"
import { RenderSettings } from "../../services/SettingsService"
import { useEffect, useState } from "react"

interface MapContainerProps extends BoxProps {
  map: Map
}
export const MapContainer = (props: MapContainerProps) => {
  const { map, ...boxProps } = props
  const [translated, setTranslated] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })
  useEffect(() => {
    // mouse event that moves the map when mouse is down
    const moveMap = (e: MouseEvent) => {
      if (e.buttons !== 1) {
        return
      }
      setTranslated((translated) => {
        let newPositionX = translated.x + e.movementX
        let newPositionY = translated.y + e.movementY

        const maxScrollX =
          newPositionX < -((map.colCount / 2) * RenderSettings.tileSize) ||
          newPositionX > (map.colCount / 2) * RenderSettings.tileSize
        if (maxScrollX) {
          newPositionX = translated.x
        }

        const maxScrollY =
          newPositionY < -((map.rowCount / 2) * RenderSettings.tileSize) ||
          newPositionY > (map.rowCount / 2) * RenderSettings.tileSize
        if (maxScrollY) {
          newPositionY = translated.y
        }

        return {
          x: newPositionX,
          y: newPositionY,
        }
      })
    }
    window.addEventListener("mousemove", moveMap)
    return () => {
      window.removeEventListener("mousemove", moveMap)
    }
  }, [])
  if (!map) {
    return null
  }
  const { rowCount, colCount } = map
  const mapWidth = RenderSettings.tileSize * rowCount
  const mapHeight = RenderSettings.tileSize * colCount
  return (
    <Center width="full" height="full">
      <Box
        borderRadius="xl"
        overflow="hidden"
        display="flex"
        flexWrap="wrap"
        boxShadow="0 0 0px 10px #333"
        width={mapWidth + "px"}
        height={mapHeight + "px"}
        flexShrink={0}
        position="relative"
        bgGradient="radial(green.700, green.900)"
        transform="auto"
        translateX={translated.x + "px"}
        translateY={translated.y + "px"}
        {...boxProps}
      />
    </Center>
  )
}
