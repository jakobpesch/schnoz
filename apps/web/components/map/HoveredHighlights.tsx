import { ArrowForwardIcon } from "@chakra-ui/icons"
import {
  Box,
  Circle,
  Flex,
  HStack,
  Kbd,
  Stack,
  Text,
  useToken,
} from "@chakra-ui/react"
import {
  Card,
  transformCoordinates,
  translateCoordinatesTo,
} from "coordinate-utils"
import { Participant, Unit } from "database"
import Mousetrap from "mousetrap"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { Coordinate, TransformedConstellation } from "types"
import {
  Special,
  SpecialType,
  expandBuildRadiusByOne,
} from "../../services/GameManagerService"
import { RenderSettings } from "../../services/SettingsService"
import { socketApi } from "../../services/SocketService"
import { scaled } from "../ui/UIScoreView"
import { getPlayerNumber, useMatchStore } from "../../store"
import { HighlightMesh, LAYERS, TileMesh, UnitMesh } from "../../pages/webgl"

const mousePositionToMapCoordinates = (
  mouseX: number,
  mouseY: number,
  tileSizeInPx: number,
) => {
  const row = Math.floor(mouseX / tileSizeInPx)
  const col = Math.floor(mouseY / tileSizeInPx)
  return [row, col] as Coordinate
}

const unitFactory = (unit: Partial<Unit>) => {
  return {
    id: "",
    ownerId: "",
    type: "UNIT",
    row: 0,
    col: 0,
    mapId: "",
    ...unit,
  } as Unit
}

export interface HoveredHighlightsProps {
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
    rotatedClockwise: TransformedConstellation["rotatedClockwise"],
    mirrored: TransformedConstellation["mirrored"],
  ) => void
}

export const HoveredHighlights = (props: HoveredHighlightsProps) => {
  const { opponentsHoveredCoordinates, hoveredCoordinate, selectedCard } =
    useMatchStore()

  const [rotatedClockwise, setRotationCount] =
    useState<TransformedConstellation["rotatedClockwise"]>(0)
  const [mirrored, setMirrored] =
    useState<TransformedConstellation["mirrored"]>(false)

  const mapContainerElement = document.getElementById("map-container")
  const bounds = mapContainerElement?.getBoundingClientRect()
  const rotate = () => {
    const correctedRotationCount = (
      rotatedClockwise === 3 ? 0 : rotatedClockwise + 1
    ) as TransformedConstellation["rotatedClockwise"]

    setRotationCount(correctedRotationCount)
  }
  const mirror = () => {
    setMirrored(!mirrored)
  }

  useEffect(() => {
    Mousetrap.bind("r", rotate)
  })

  useEffect(() => {
    Mousetrap.bind("e", mirror)
  })

  // document.onmousemove = (event: MouseEvent) => {
  //   if (!bounds) {
  //     return
  //   }
  //   const coordinate = mousePositionToMapCoordinates(
  //     event.clientY - bounds.top,
  //     event.clientX - bounds.left,
  //     RenderSettings.tileSize,
  //   )
  //   setHoveredCoordinate(coordinate)
  // }

  const hoveredCoordinates = useMemo(() => {
    if (selectedCard && hoveredCoordinate) {
      const transformed = transformCoordinates(selectedCard.coordinates, {
        rotatedClockwise,
        mirrored,
      })
      const translated = translateCoordinatesTo(hoveredCoordinate, transformed)
      socketApi.sendHoveredCoordinates(translated)
      return translated
    }

    return []
  }, [selectedCard, hoveredCoordinate, rotatedClockwise, mirrored])

  useEffect(() => {
    if (selectedCard === null) {
      socketApi.sendHoveredCoordinates(null)
    }
  }, [selectedCard])

  const color = useToken(
    "colors",
    RenderSettings.getPlayerAppearance(
      getPlayerNumber(props.activePlayer?.id ?? null),
    ).color,
  )

  if (!props.activePlayer || props.hide || !props.you) {
    return null
  }
  const hasExpandBuildRaidusByOneActive = props.activeSpecials.some(
    (special) => special.type === "EXPAND_BUILD_RADIUS_BY_1",
  )

  const availableBonusPoints =
    props.you.bonusPoints + (selectedCard?.value ?? 0)

  const specialsCost = props.activeSpecials.reduce((a, s) => a + s.cost, 0)
  const bonusFromSelectedCard = selectedCard?.value ?? 0
  const resultingBonusPoints =
    props.you.bonusPoints + bonusFromSelectedCard - specialsCost

  return (
    <>
      {[...(opponentsHoveredCoordinates ?? []), ...hoveredCoordinates].map(
        ([row, col]) => {
          return (
            <>
              <UnitMesh
                key={row + "_" + col + "_unit"}
                position={[col, -row, LAYERS.UNITS_HIGHLIGHT]}
                unit={unitFactory({ ownerId: props.activePlayer?.id })}
                opacity={0.6}
                onClick={() =>
                  props.onTileClick(row, col, rotatedClockwise, mirrored)
                }
              />
              <HighlightMesh
                key={row + "_" + col + "_highlight"}
                opacity={0.4}
                color={color}
                position={[col, -row, LAYERS.TERRAIN_HIGHLIGHT]}
              />
            </>
          )
        },
      )}

      {/* <Box
        bg="red"
        position="fixed"
        left={scaled(4)}
        top={scaled(100)}
        cursor="default"
      >
        <Stack spacing={scaled(0)}>
          <HStack
            position="relative"
            spacing={scaled(2)}
            padding={scaled(2)}
            color="gray.100"
          >
            <Circle size={scaled(8)} background="yellow.400">
              <Text fontSize={scaled(16)} fontWeight="bold" color="yellow.800">
                {props.you.bonusPoints}
              </Text>
            </Circle>
            {(specialsCost || bonusFromSelectedCard) && (
              <>
                <ArrowForwardIcon width={scaled(8)} height={scaled(8)} />
                <Circle size={scaled(8)} background="yellow.400">
                  <Text
                    fontSize={scaled(16)}
                    fontWeight="bold"
                    color="yellow.800"
                  >
                    {resultingBonusPoints}
                  </Text>
                </Circle>
              </>
            )}
          </HStack>
          {selectedCard && (
            <>
              {[
                { hotkey: "R", label: "Rotate", action: rotate },
                { hotkey: "E", label: "Mirror", action: mirror },
              ].map((s) => (
                <HStack
                  key={s.label}
                  padding={scaled(2)}
                  color="gray.100"
                  cursor="pointer"
                  onClick={() => s.action()}
                >
                  <Kbd
                    borderColor="gray.100"
                    fontSize={scaled(20)}
                    userSelect="none"
                  >
                    <Text
                    // transform={"rotate(" + 90 * rotatedClockwise + "deg)"}
                    >
                      {s.hotkey}
                    </Text>
                  </Kbd>
                  <Text fontSize={scaled(16)} userSelect="none">
                    {s.label}
                  </Text>
                </HStack>
              ))}

              <HStack
                padding={scaled(2)}
                borderRadius={scaled(10)}
                borderWidth={scaled(2)}
                color={
                  availableBonusPoints >= expandBuildRadiusByOne.cost
                    ? "gray.100"
                    : "gray.400"
                }
                opacity={
                  availableBonusPoints >= expandBuildRadiusByOne.cost ? 1 : 0.5
                }
                background={
                  hasExpandBuildRaidusByOneActive ? "green.500" : "gray.700"
                }
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
                <Circle size={scaled(8)} background="yellow.400">
                  <Text
                    fontSize={scaled(16)}
                    fontWeight="bold"
                    color="yellow.800"
                  >
                    {expandBuildRadiusByOne.cost}
                  </Text>
                </Circle>
                <Text fontSize={scaled(16)} userSelect="none">
                  +1 Reach
                </Text>
              </HStack>
            </>
          )}
        </Stack>
      </Box> */}
    </>
  )
}
