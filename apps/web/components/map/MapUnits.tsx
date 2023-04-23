import { Flex } from "@chakra-ui/react"
import { Participant } from "database"
import Image from "next/image"
import { RenderSettings } from "../../services/SettingsService"
import { TileWithUnit } from "../../types/Tile"
import { coordinatesAreEqual } from "../../utils/coordinateUtils"

export const MapUnits = (props: {
  players: Participant[]
  unitTiles: TileWithUnit[]
  updatedUnitTiles: TileWithUnit[]
}) => {
  return (
    <>
      {props.unitTiles.map((tile) => {
        const { unit, color } = RenderSettings.getPlayerAppearance(
          props.players.find((player) => player.id === tile.unit?.ownerId)
            ?.playerNumber
        )
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
            // bg={color}
            bg={
              props.updatedUnitTiles.find((ut) =>
                coordinatesAreEqual([ut.row, ut.col], [tile.row, tile.col])
              )
                ? "rgba(0,0,0,0.2)"
                : "rgba(0,0,0,0.1)"
            }
          >
            <Image src={unit} height="100%" width="100%" />
            {/* <MapObject object={unit} /> */}
          </Flex>
        )
      })}
    </>
  )
}
