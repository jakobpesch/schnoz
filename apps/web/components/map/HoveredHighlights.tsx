import { useToast, useToken } from "@chakra-ui/react"
import { animated, config, useSpring } from "@react-spring/three"
import {
  coordinatesAreEqual,
  getTileLookup,
  transformCoordinates,
  translateCoordinatesTo,
} from "coordinate-utils"

import { Unit } from "database"
import { checkConditionsForUnitConstellationPlacement } from "game-logic"
import Mousetrap from "mousetrap"
import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import { PlacementRuleName, TransformedConstellation } from "types"
import { HighlightSquare, LAYERS, UnitMesh } from "../../pages/webgl"
import { Special } from "../../services/GameManagerService"
import { RenderSettings } from "../../services/SettingsService"
import { socketApi } from "../../services/SocketService"
import { getPlayerNumber, setSelectedCard, useMatchStore } from "../../store"
import { MapRuleEvaluations } from "./MapRuleEvaluations"
import { useSound } from "../../providers/SoundProvider"
import { useFrame, useThree } from "@react-three/fiber"

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
  hide?: boolean
}

export const HoveredHighlights = (props: HoveredHighlightsProps) => {
  const toast = useToast()
  const state = useThree()
  const oldCameraPosition = useRef(state.camera.position)
  const { playSFX } = useSound()
  const userId = useMatchStore((state) => state.userId())
  const [isUpdatingMatch, setIsUpdatingMatch] = useState(false)
  const [activatedSpecials, setActivatedSpecials] = useState<Special[]>([])

  const match = useMatchStore((state) => state.match)
  const gameSettings = useMatchStore((state) => state.gameSettings)
  const you = useMatchStore((state) => state.you())
  const participants = useMatchStore((state) => state.participants)
  const yourTurn = useMatchStore((state) => state.yourTurn())
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

  const [rotatedClockwise, setRotationCount] =
    useState<TransformedConstellation["rotatedClockwise"]>(0)
  const [mirrored, setMirrored] =
    useState<TransformedConstellation["mirrored"]>(false)

  const [springs, api] = useSpring(() => {
    const [hoveredRow, hoveredCol] = hoveredCoordinate ?? [0, 0]
    return {
      opacity: 0,
      scale: 0.1,
      position: [hoveredCol, -hoveredRow, LAYERS.UNITS_HIGHLIGHT],
      color: "#ff6d6d",
      config: config.stiff,
    }
  }, [hoveredCoordinate])

  useEffect(() => {
    const canvasElement = document.getElementById("match-canvas")
    if (canvasElement) {
      canvasElement.style.cursor = selectedCard ? "grabbing" : "default"
    }
  }, [selectedCard])

  const rotate = () => {
    const correctedRotationCount = (
      rotatedClockwise === 3 ? 0 : rotatedClockwise + 1
    ) as TransformedConstellation["rotatedClockwise"]

    setRotationCount(correctedRotationCount)
    playSFX("pop")
  }
  const mirror = () => {
    setMirrored(!mirrored)
    playSFX("pop")
  }

  useEffect(() => {
    Mousetrap.bind("r", rotate)
  })

  useEffect(() => {
    Mousetrap.bind("e", mirror)
  })

  const transformedCoordinates = useMemo(() => {
    if (selectedCard && hoveredCoordinate) {
      const transformed = transformCoordinates(selectedCard.coordinates, {
        rotatedClockwise,
        mirrored,
      })
      const translated = translateCoordinatesTo(hoveredCoordinate, transformed)
      socketApi.sendHoveredCoordinates(translated)
      return transformed
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
      getPlayerNumber(activeParticipant?.id ?? null),
    ).color,
  )

  const onTileClick = async (
    row: number,
    col: number,
    rotatedClockwise: TransformedConstellation["rotatedClockwise"],
    mirrored: TransformedConstellation["mirrored"],
  ) => {
    if (isUpdatingMatch) {
      return
    }

    if (!gameSettings) {
      return
    }

    if (!userId) {
      return
    }

    if (!match) {
      return
    }

    if (!selectedCard) {
      return
    }

    const unitConstellation: TransformedConstellation = {
      coordinates: selectedCard.coordinates,
      value: selectedCard.value,
      rotatedClockwise,
      mirrored,
    }

    try {
      if (!you) {
        throw new Error("Could not find your id")
      }

      if (!tilesWithUnits) {
        throw new Error("No tiles")
      }

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
        you?.id ?? null,
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

  if (!activeParticipant || props.hide || !you) {
    return null
  }
  const hasExpandBuildRaidusByOneActive = activatedSpecials.some(
    (special) => special.type === "EXPAND_BUILD_RADIUS_BY_1",
  )

  const availableBonusPoints = you.bonusPoints + (selectedCard?.value ?? 0)

  const specialsCost = activatedSpecials.reduce((a, s) => a + s.cost, 0)
  const bonusFromSelectedCard = selectedCard?.value ?? 0
  const resultingBonusPoints =
    you.bonusPoints + bonusFromSelectedCard - specialsCost

  return (
    <>
      {showRuleEvaluationHighlights && (
        <MapRuleEvaluations coordinates={showRuleEvaluationHighlights} />
      )}
      {hoveredCoordinate && (
        <animated.group
          key={`${hoveredCoordinate[0]}_${hoveredCoordinate[1]}group`}
          /// @ts-ignore: Spring type is Vector3 Type (Typescript return error on position)
          position={springs.position}
        >
          {transformedCoordinates.map((c) => (
            <Fragment key={`${c[0]}_${c[1]}unitmesh`}>
              <UnitMesh
                position={[c[1], -c[0], LAYERS.UNITS_HIGHLIGHT]}
                unit={unitFactory({ ownerId: activeParticipant?.id })}
                opacity={0.6}
                onPointerUp={(e) => {
                  console.log(e.button)

                  if (e.button === 2) {
                    onTileClick(
                      hoveredCoordinate[0],
                      hoveredCoordinate[1],
                      rotatedClockwise,
                      mirrored,
                    )
                  }
                }}
              />
              <HighlightSquare
                opacity={0.1}
                color={color}
                position={[c[1], -c[0], LAYERS.TERRAIN_HIGHLIGHT]}
              />
            </Fragment>
          ))}
        </animated.group>
      )}
      {opponentsHoveredCoordinates?.map(([row, col]) => {
        return (
          <Fragment key={`${row}_${col}unitmesh`}>
            <UnitMesh
              position={[col, -row, LAYERS.UNITS_HIGHLIGHT]}
              unit={unitFactory({ ownerId: activeParticipant?.id })}
              opacity={0.6}
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
