import { Flex } from "@chakra-ui/react"
import { Participant } from "database"
import Image from "next/image"
import { RenderSettings } from "../../services/SettingsService"
import { TileWithUnit } from "types"
import { coordinatesAreEqual } from "coordinate-utils"

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
            // background={color}
            background={
              props.updatedUnitTiles.find((ut) =>
                coordinatesAreEqual([ut.row, ut.col], [tile.row, tile.col])
              )
                ? "rgba(0,0,0,0.2)"
                : "rgba(0,0,0,0.1)"
            }
            userSelect="none"
          >
            <Image
              src={unit}
              height={RenderSettings.tileSize}
              width={RenderSettings.tileSize}
              alt="unit"
            />
            {/* <MapObject object={unit} /> */}
          </Flex>
        )
      })}
    </>
  )
}
