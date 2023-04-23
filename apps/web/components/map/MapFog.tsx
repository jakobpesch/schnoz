import { Flex } from "@chakra-ui/react"
import { RenderSettings } from "../../services/SettingsService"
import { TileWithUnit } from "../../types/Tile"

export const MapFog = (props: {
  fogTiles: TileWithUnit[]
  halfFogTiles: TileWithUnit[]
}) => {
  return (
    <>
      {props.fogTiles.map((tile) => {
        return (
          <Flex
            key={tile.row + "_" + tile.col}
            position="absolute"
            align="center"
            justify="center"
            top={tile.row * RenderSettings.tileSize + "px"}
            left={tile.col * RenderSettings.tileSize + "px"}
            width={RenderSettings.tileSize + "px"}
            height={RenderSettings.tileSize + "px"}
            pointerEvents="none"
            bg="black"
          />
        )
      })}
      {props.halfFogTiles.map((tile) => {
        return (
          <Flex
            key={tile.row + "_" + tile.col}
            position="absolute"
            align="center"
            justify="center"
            top={tile.row * RenderSettings.tileSize + "px"}
            left={tile.col * RenderSettings.tileSize + "px"}
            width={RenderSettings.tileSize + "px"}
            height={RenderSettings.tileSize + "px"}
            pointerEvents="none"
            opacity={0.5}
            bg="black"
          />
        )
      })}
    </>
  )
}
