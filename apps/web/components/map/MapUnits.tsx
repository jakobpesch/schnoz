import { Flex, useToken } from "@chakra-ui/react"
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
  const playerColors = useToken("colors", [
    RenderSettings.getPlayerAppearance(0).color,
    RenderSettings.getPlayerAppearance(1).color,
  ])

  return (
    <>
      {props.unitTiles.map((tile) => {
        const playerNumber = props.players.find(
          (player) => player.id === tile.unit?.ownerId,
        )?.playerNumber
        const { unit } = RenderSettings.getPlayerAppearance(playerNumber)

        const hexColor =
          playerNumber != null ? playerColors[playerNumber] : "transparent"

        return (
          <Flex
            key={tile.row + "_" + tile.col + "_unit"}
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
                coordinatesAreEqual([ut.row, ut.col], [tile.row, tile.col]),
              )
                ? hexColor + "dd"
                : hexColor + "80"
            }
            userSelect="none"
          >
            <Image
              src={unit}
              priority
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
