import { useToast, useToken } from "@chakra-ui/react"
import {
  coordinatesAreEqual,
  transformCoordinates,
  translateCoordinatesTo,
} from "coordinate-utils"
import { Unit } from "database"
import { checkConditionsForUnitConstellationPlacement } from "game-logic"
import Mousetrap from "mousetrap"
import { useEffect, useMemo, useState } from "react"
import { Coordinate, PlacementRuleName, TransformedConstellation } from "types"
import { HighlightMesh, LAYERS, UnitMesh } from "../../pages/webgl"
import { Special } from "../../services/GameManagerService"
import { RenderSettings } from "../../services/SettingsService"
import { socketApi } from "../../services/SocketService"
import { getPlayerNumber, setSelectedCard, useStore } from "../../store"
import { PlaceableTiles } from "./PlaceableTiles"

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
  const userId = useStore((state) => state.userId())
  const [isUpdatingMatch, setIsUpdatingMatch] = useState(false)
  const [activatedSpecials, setActivatedSpecials] = useState<Special[]>([])

  const match = useStore((state) => state.match)
  const you = useStore((state) => state.you())
  const participants = useStore((state) => state.participants)
  const yourTurn = useStore((state) => state.yourTurn())
  const map = useStore((state) => state.map)
  const activeParticipant = useStore((state) => state.activeParticipant())
  const tilesWithUnits = useStore((state) => state.tilesWithUnits)
  const hoveredCoordinate = useStore((state) => state.hoveredCoordinate)
  const opponentsHoveredCoordinates = useStore(
    (state) => state.opponentsHoveredCoordinates,
  )
  const selectedCard = useStore((state) => state.selectedCard)

  const placeableCoordinates =
    useMemo(() => {
      if (!yourTurn || !match || !tilesWithUnits || !participants) {
        return []
      }

      const placeableCoordiantes = tilesWithUnits
        .map((t) =>
          checkConditionsForUnitConstellationPlacement(
            [t.row, t.col],
            {
              coordinates: [[0, 0]],
              mirrored: false,
              rotatedClockwise: 0,
              value: 0,
            },
            match,
            activeParticipant,
            map,
            tilesWithUnits,
            [],
            you?.id ?? null,
            activatedSpecials,
          ),
        )
        .filter((v) => typeof v.error === "undefined")
        .map((v) => v.translatedCoordinates?.[0] ?? null)
        .filter(Boolean) as Coordinate[]

      return placeableCoordiantes
    }, [match, tilesWithUnits, selectedCard, activatedSpecials]) ?? []

  const [rotatedClockwise, setRotationCount] =
    useState<TransformedConstellation["rotatedClockwise"]>(0)
  const [mirrored, setMirrored] =
    useState<TransformedConstellation["mirrored"]>(false)

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

      const ignoredRules: PlacementRuleName[] =
        unitConstellation.coordinates.length === 1 &&
        coordinatesAreEqual(unitConstellation.coordinates[0], [0, 0])
          ? ["ADJACENT_TO_ALLY"]
          : []

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
      <PlaceableTiles placeableCoordinates={placeableCoordinates} />
      {[...(opponentsHoveredCoordinates ?? []), ...hoveredCoordinates].map(
        ([row, col]) => {
          return (
            <>
              <UnitMesh
                key={row + "_" + col + "_unit"}
                position={[col, -row, LAYERS.UNITS_HIGHLIGHT]}
                unit={unitFactory({ ownerId: activeParticipant?.id })}
                opacity={0.6}
                onClick={() =>
                  onTileClick(row, col, rotatedClockwise, mirrored)
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
    </>
  )
}
