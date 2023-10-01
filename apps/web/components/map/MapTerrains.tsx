import { Flex } from "@chakra-ui/react"
import { Terrain } from "database"
import Image, { StaticImageData } from "next/image"
import terrainStone from "../../assets/sprites/terrain_stone.png"
import terrainTree from "../../assets/sprites/terrain_tree.png"
import terrainWater from "../../assets/sprites/terrain_water.png"
import { RenderSettings } from "../../services/SettingsService"
import { TileWithUnit } from "types"

export const MapTerrains = (props: { terrainTiles: TileWithUnit[] }) => {
  let terrain: StaticImageData
  return (
    <>
      {props.terrainTiles.map((tile) => {
        if (tile.terrain === Terrain.WATER) {
          terrain = terrainWater
        }
        if (tile.terrain === Terrain.TREE) {
          terrain = terrainTree
        }
        if (tile.terrain === Terrain.STONE) {
          terrain = terrainStone
        }
        return (
          <Flex
            key={tile.row + "_" + tile.col + "_terrain"}
            position="absolute"
            align="center"
            justify="center"
            top={tile.row * RenderSettings.tileSize + "px"}
            left={tile.col * RenderSettings.tileSize + "px"}
            width={RenderSettings.tileSize + "px"}
            height={RenderSettings.tileSize + "px"}
            pointerEvents="none"
          >
            <Image
              src={terrain}
              height={RenderSettings.tileSize}
              width={RenderSettings.tileSize}
              alt="tile"
            />
            {/* <MapObject object={terrain} /> */}
          </Flex>
        )
      })}
    </>
  )
}
