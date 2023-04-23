import { ArrowForwardIcon } from "@chakra-ui/icons"
import { Box, Circle, Flex, HStack, Kbd, Stack, Text } from "@chakra-ui/react"
import { Participant } from "database"
import Mousetrap from "mousetrap"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import {
  Coordinate2D,
  IUnitConstellation,
} from "../../models/UnitConstellation.model"
import {
  expandBuildRadiusByOne,
  Special,
  SpecialType,
} from "../../services/GameManagerService"
import { RenderSettings } from "../../services/SettingsService"
import { socketApi } from "../../services/SocketService"
import {
  Card,
  transformCoordinates,
  translateCoordinatesTo,
} from "../../utils/constallationTransformer"
import { viewFactorWidth } from "../ui/UIScoreView"

const mousePositionToMapCoordinates = (
  mouseX: number,
  mouseY: number,
  tileSizeInPx: number
) => {
  const row = Math.floor(mouseX / tileSizeInPx)
  const col = Math.floor(mouseY / tileSizeInPx)
  return [row, col] as Coordinate2D
}

export interface MapHoveredHighlightsProps {
  you: Participant | null
  activePlayer: Participant | null
  hide?: boolean
  card: Card | null
  specials: Special[]
  activeSpecials: Special[]
  setSpecial: (specialType: SpecialType, active: boolean) => void
  onTileClick: (
    row: number,
    col: number,
    rotatedClockwise: IUnitConstellation["rotatedClockwise"],
    mirrored: IUnitConstellation["mirrored"]
  ) => void
}

export const MapHoveredHighlights = (props: MapHoveredHighlightsProps) => {
  const [hoveredCoordinate, setHoveredCoordinate] =
    useState<Coordinate2D | null>(null)
  const [opponentsHoveredTiles, setOpponentsHoveredTiles] = useState<
    Coordinate2D[] | null
  >(null)
  const [rotatedClockwise, setRotationCount] =
    useState<IUnitConstellation["rotatedClockwise"]>(0)
  const [mirrored, setMirrored] =
    useState<IUnitConstellation["mirrored"]>(false)

  const mapContainerElement = document.getElementById("map-container")
  const bounds = mapContainerElement?.getBoundingClientRect()
  const rotate = () => {
    const correctedRotationCount = (
      rotatedClockwise === 3 ? 0 : rotatedClockwise + 1
    ) as IUnitConstellation["rotatedClockwise"]

    setRotationCount(correctedRotationCount)
  }
  const mirror = () => {
    setMirrored(!mirrored)
  }

  useEffect(() => {
    socketApi.setCallbacks({ setOpponentsHoveredTiles })
  }, [])

  useEffect(() => {
    Mousetrap.bind("r", rotate)
  })

  useEffect(() => {
    Mousetrap.bind("e", mirror)
  })

  document.onmousemove = (event: MouseEvent) => {
    if (!bounds) {
      return
    }
    const coordinate = mousePositionToMapCoordinates(
      event.clientY - bounds.top,
      event.clientX - bounds.left,
      RenderSettings.tileSize
    )
    setHoveredCoordinate(coordinate)
  }

  const hoveredCoordinates = useMemo(() => {
    if (props.card && hoveredCoordinate) {
      const transformed = transformCoordinates(props.card.coordinates, {
        rotatedClockwise,
        mirrored,
      })
      const translated = translateCoordinatesTo(hoveredCoordinate, transformed)
      socketApi.sendHoveredCoordinates(translated)
      return translated
    }
    return []
  }, [props.card, hoveredCoordinate, rotatedClockwise, mirrored])

  useEffect(() => {
    if (props.card === null) {
      socketApi.sendHoveredCoordinates(null)
    }
  }, [props.card])

  if (!props.activePlayer || props.hide || !props.you) {
    return null
  }
  const hasExpandBuildRaidusByOneActive = props.activeSpecials.some(
    (special) => special.type === "EXPAND_BUILD_RADIUS_BY_1"
  )

  const availableBonusPoints = props.you.bonusPoints + (props.card?.value ?? 0)

  const specialsCost = props.activeSpecials.reduce((a, s) => a + s.cost, 0)
  const bonusFromSelectedCard = props.card?.value ?? 0
  const resultingBonusPoints =
    props.you.bonusPoints + bonusFromSelectedCard - specialsCost

  return (
    <>
      <Box
        position="fixed"
        left={viewFactorWidth(10)}
        top={viewFactorWidth(100)}
        cursor="default"
      >
        <Stack spacing={viewFactorWidth(10)}>
          <HStack
            position="relative"
            spacing={viewFactorWidth(5)}
            p={viewFactorWidth(10)}
            color="gray.100"
          >
            <Circle size={viewFactorWidth(30)} bg="yellow.400">
              <Text
                fontSize={viewFactorWidth(20)}
                fontWeight="bold"
                color="yellow.800"
              >
                {props.you.bonusPoints}
              </Text>
            </Circle>
            {(specialsCost || bonusFromSelectedCard) && (
              <>
                <ArrowForwardIcon
                  w={viewFactorWidth(20)}
                  h={viewFactorWidth(20)}
                />
                <Circle size={viewFactorWidth(30)} bg="yellow.400">
                  <Text
                    fontSize={viewFactorWidth(20)}
                    fontWeight="bold"
                    color="yellow.800"
                  >
                    {resultingBonusPoints}
                  </Text>
                </Circle>
              </>
            )}
          </HStack>
          {props.card && (
            <>
              {[
                { hotkey: "R", label: "Rotate", action: rotate },
                { hotkey: "E", label: "Mirror", action: mirror },
              ].map((s) => (
                <HStack
                  key={s.label}
                  p={viewFactorWidth(5)}
                  color="gray.100"
                  cursor="pointer"
                  onClick={() => s.action()}
                >
                  <Kbd
                    borderColor="gray.100"
                    fontSize={viewFactorWidth(20)}
                    userSelect="none"
                  >
                    <Text
                    // transform={"rotate(" + 90 * rotatedClockwise + "deg)"}
                    >
                      {s.hotkey}
                    </Text>
                  </Kbd>
                  <Text fontSize={viewFactorWidth(20)} userSelect="none">
                    {s.label}
                  </Text>
                </HStack>
              ))}

              <HStack
                p={viewFactorWidth(10)}
                borderRadius={viewFactorWidth(10)}
                borderWidth={viewFactorWidth(2)}
                color={
                  availableBonusPoints >= expandBuildRadiusByOne.cost
                    ? "gray.100"
                    : "gray.400"
                }
                opacity={
                  availableBonusPoints >= expandBuildRadiusByOne.cost ? 1 : 0.5
                }
                bg={hasExpandBuildRaidusByOneActive ? "green.500" : "gray.700"}
                cursor="pointer"
                onClick={() => {
                  if (availableBonusPoints >= expandBuildRadiusByOne.cost) {
                    props.setSpecial(
                      "EXPAND_BUILD_RADIUS_BY_1",
                      !hasExpandBuildRaidusByOneActive
                    )
                  }
                }}
              >
                <Circle size={viewFactorWidth(20)} bg="yellow.400">
                  <Text
                    fontSize={viewFactorWidth(15)}
                    fontWeight="bold"
                    color="yellow.800"
                  >
                    {expandBuildRadiusByOne.cost}
                  </Text>
                </Circle>
                <Text fontSize={viewFactorWidth(20)} userSelect="none">
                  +1 Reach
                </Text>
              </HStack>
            </>
          )}
        </Stack>
      </Box>

      {hoveredCoordinates.map(([row, col]) => {
        return (
          <Flex
            key={row + "_" + col}
            position="absolute"
            align="center"
            justify="center"
            top={row * RenderSettings.tileSize + "px"}
            left={col * RenderSettings.tileSize + "px"}
            width={RenderSettings.tileSize + "px"}
            height={RenderSettings.tileSize + "px"}
            bg={"whiteAlpha.500"}
            opacity={0.6}
            onClick={() =>
              props.onTileClick(row, col, rotatedClockwise, mirrored)
            }
          >
            <Image
              src={
                RenderSettings.getPlayerAppearance(
                  props.activePlayer?.playerNumber
                ).unit
              }
              height="100%"
              width="100%"
            />
            {/* <MapObject
              object={
                RenderSettings.getPlayerAppearance(props.player?.playerNumber)
                  .unit
              }
            /> */}
          </Flex>
        )
      })}
      {opponentsHoveredTiles?.map(([row, col]) => {
        return (
          <Flex
            key={row + "_" + col}
            position="absolute"
            align="center"
            justify="center"
            top={row * RenderSettings.tileSize + "px"}
            left={col * RenderSettings.tileSize + "px"}
            width={RenderSettings.tileSize + "px"}
            height={RenderSettings.tileSize + "px"}
            bg={"whiteAlpha.500"}
            opacity={0.6}
            onClick={() =>
              props.onTileClick(row, col, rotatedClockwise, mirrored)
            }
          >
            <Image
              src={
                RenderSettings.getPlayerAppearance(
                  props.activePlayer?.playerNumber
                ).unit
              }
              height="100%"
              width="100%"
            />
            {/* <MapObject
              object={
                RenderSettings.getPlayerAppearance(props.player?.playerNumber)
                  .unit
              }
            /> */}
          </Flex>
        )
      })}
    </>
  )
}
