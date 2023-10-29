import { useToast, useToken } from "@chakra-ui/react"
import { animated, config, useSpring } from "@react-spring/three"
import {
  coordinatesAreEqual,
  getTileLookup,
  transformCoordinates,
  translateCoordinatesTo,
} from "coordinate-utils"

import { checkConditionsForUnitConstellationPlacement } from "game-logic"
import Mousetrap from "mousetrap"
import { Fragment, useEffect, useMemo, useState } from "react"
import { PlacementRuleName, TransformedConstellation } from "types"
import { HighlightSquare, LAYERS } from "../../pages/webgl"
import { useMaterial } from "../../providers/MaterialProvider"
import { useSound } from "../../providers/SoundProvider"
import { Special } from "../../services/GameManagerService"
import { RenderSettings } from "../../services/SettingsService"
import { socketApi } from "../../services/SocketService"
import { getPlayerNumber, setSelectedCard, useMatchStore } from "../../store"
import { UnitMesh } from "../ui/meshes/UnitMesh"
import { MapRuleEvaluations } from "./MapRuleEvaluations"

export interface HoveredHighlightsProps {
  hide?: boolean
}

export const HoveredHighlights = (props: HoveredHighlightsProps) => {
  const toast = useToast()
  const { bobTransparentSpriteMaterial, ulfTransparentSpriteMaterial } =
    useMaterial()
  const { playSFX } = useSound()
  const userId = useMatchStore((state) => state.userId())
  const [isUpdatingMatch, setIsUpdatingMatch] = useState(false)
  const [activatedSpecials, setActivatedSpecials] = useState<Special[]>([])

  const match = useMatchStore((state) => state.match)
  const gameSettings = useMatchStore((state) => state.gameSettings)
  const you = useMatchStore((state) => state.you())
  const participants = useMatchStore((state) => state.participants)
  const map = useMatchStore((state) => state.map)
  const activeParticipant = useMatchStore((state) => state.activeParticipant())
  const tilesWithUnits = useMatchStore((state) => state.tilesWithUnits)
  const hoveredCoordinate = useMatchStore((state) => state.hoveredCoordinate)
  const showRuleEvaluationHighlights = useMatchStore(
    (state) => state.showRuleEvaluationHighlights,
  )

  const opponentsHoveredCoordinates = useMatchStore(
    (state) => state.opponentsHoveredCoordinates,
  )
  const selectedCard = useMatchStore((state) => state.selectedCard)

  const [rotationCount, setRotationCount] =
    useState<TransformedConstellation["rotatedClockwise"]>(0)
  const [mirrored, setMirrored] =
    useState<TransformedConstellation["mirrored"]>(false)

  const [springs, api] = useSpring(() => {
    return {
      position: [0, 0, LAYERS.UNITS_HIGHLIGHT],
      config: config.stiff,
    }
  })

  useEffect(() => {
    if (!hoveredCoordinate) {
      return
    }
    const [hoveredRow, hoveredCol] = hoveredCoordinate
    api.start({ position: [hoveredCol, -hoveredRow, LAYERS.UNITS_HIGHLIGHT] })
  }, [hoveredCoordinate])

  useEffect(() => {
    const canvasElement = document.getElementById("match-canvas")
    if (canvasElement) {
      canvasElement.style.cursor = selectedCard ? "grabbing" : "default"
    }
  }, [selectedCard])

  useEffect(() => {
    const rotate = () => {
      const correctedRotationCount = (
        rotationCount === 3 ? 0 : rotationCount + 1
      ) as TransformedConstellation["rotatedClockwise"]

      setRotationCount(correctedRotationCount)
      playSFX("pop")
    }
    Mousetrap.bind("r", rotate)
  }, [rotationCount])

  useEffect(() => {
    const mirror = () => {
      setMirrored(!mirrored)
      playSFX("pop")
    }
    Mousetrap.bind("e", mirror)
  }, [mirrored])

  const transformedCoordinates = useMemo(() => {
    if (selectedCard && hoveredCoordinate) {
      const transformed = transformCoordinates(selectedCard.coordinates, {
        rotatedClockwise: rotationCount,
        mirrored,
      })
      const translated = translateCoordinatesTo(hoveredCoordinate, transformed)
      socketApi.sendHoveredCoordinates(translated)
      return transformed
    }

    return []
  }, [selectedCard, hoveredCoordinate, rotationCount, mirrored])

  useEffect(() => {
    if (selectedCard === null) {
      socketApi.sendHoveredCoordinates(null)
    }
  }, [selectedCard])

  const color = useToken(
    "colors",
    RenderSettings.getPlayerAppearance(
      getPlayerNumber(activeParticipant?.id ?? null),
    ).color,
  )

  if (!activeParticipant || props.hide || !you) {
    return null
  }

  const onTileClick = async (
    row: number,
    col: number,
    rotatedClockwise: TransformedConstellation["rotatedClockwise"],
    mirrored: TransformedConstellation["mirrored"],
  ) => {
    if (
      isUpdatingMatch ||
      !gameSettings ||
      !userId ||
      !match ||
      !selectedCard ||
      !you ||
      !tilesWithUnits
    ) {
      return
    }

    const unitConstellation: TransformedConstellation = {
      coordinates: selectedCard.coordinates,
      value: selectedCard.value,
      rotatedClockwise,
      mirrored,
    }

    try {
      const ignoredRules: PlacementRuleName[] =
        unitConstellation.coordinates.length === 1 &&
        coordinatesAreEqual(unitConstellation.coordinates[0], [0, 0])
          ? ["ADJACENT_TO_ALLY"]
          : []
      const tileLookup = getTileLookup(tilesWithUnits)
      const { error } = checkConditionsForUnitConstellationPlacement(
        [row, col],
        unitConstellation,
        match,
        activeParticipant,
        map,
        tilesWithUnits,
        ignoredRules,
        you.id,
        activatedSpecials,
        gameSettings,
        tileLookup,
      )

      if (error) {
        toast({
          title: error.message,
          status: "info",
          position: "bottom-left",
        })
        return
      }

      setIsUpdatingMatch(true)

      await socketApi.makeMove({
        matchId: match?.id,
        row,
        col,
        participantId: you.id,
        unitConstellation,
        ignoredRules,
        specials: ignoredRules.includes("ADJACENT_TO_ALLY")
          ? activatedSpecials.filter(
              (special) => special.type !== "EXPAND_BUILD_RADIUS_BY_1",
            )
          : activatedSpecials,
      })
      // playSound()
      setSelectedCard(null)
      setActivatedSpecials([])
    } catch (e: any) {
      console.error(e.message)
    } finally {
      setIsUpdatingMatch(false)
    }
  }

  return (
    <>
      {showRuleEvaluationHighlights && (
        <MapRuleEvaluations coordinates={showRuleEvaluationHighlights} />
      )}
      {hoveredCoordinate && (
        <animated.group
          key={`${hoveredCoordinate[0]}_${hoveredCoordinate[1]}group`}
          // @ts-ignore: Spring type is Vector3 Type (Typescript return error on position)
          position={springs.position}
        >
          {transformedCoordinates.map((c) => (
            <Fragment key={`${c[0]}_${c[1]}unitmesh`}>
              <UnitMesh
                position={[c[1], -c[0], LAYERS.UNITS_HIGHLIGHT]}
                material={
                  activeParticipant?.id === participants?.[0].id
                    ? bobTransparentSpriteMaterial
                    : ulfTransparentSpriteMaterial
                }
                onPointerUp={(e) => {
                  if (e.button === 2) {
                    onTileClick(
                      hoveredCoordinate[0],
                      hoveredCoordinate[1],
                      rotationCount,
                      mirrored,
                    )
                  }
                }}
              />
              {/* <HighlightSquare
                opacity={0.1}
                color={color}
                position={[c[1], -c[0], LAYERS.TERRAIN_HIGHLIGHT]}
              /> */}
            </Fragment>
          ))}
        </animated.group>
      )}
      {opponentsHoveredCoordinates?.map(([row, col]) => {
        return (
          <Fragment key={`${row}_${col}unitmesh`}>
            <UnitMesh
              position={[col, -row, LAYERS.UNITS_HIGHLIGHT]}
              material={
                activeParticipant?.id === participants?.[0].id
                  ? bobTransparentSpriteMaterial
                  : ulfTransparentSpriteMaterial
              }
            />
            <HighlightSquare
              opacity={0.1}
              color={color}
              position={[col, -row, LAYERS.TERRAIN_HIGHLIGHT]}
            />
          </Fragment>
        )
      })}
    </>
  )
}
