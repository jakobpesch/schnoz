import { Card } from "coordinate-utils"
import { Map, Match, Participant } from "database"
import { checkConditionsForUnitConstellationPlacement } from "game-logic"
import { useMemo } from "react"
import { Coordinate, ParticipantWithUser, TileWithUnit } from "types"
import { Special } from "../services/GameManagerService"
import { useTiles } from "./useTiles"

export function usePlaceableCoordinates(props: {
  match: Match | null
  map: Map | null
  activePlayer: ParticipantWithUser | null
  tilesWithUnits: TileWithUnit[] | null
  participants: Participant[] | null
  yourTurn: boolean
  selectedCard: Card | null
  activatedSpecials: Special[]
  you: Participant | null
}) {
  const {
    match,
    map,
    activePlayer,
    tilesWithUnits,
    participants,
    yourTurn,
    selectedCard,
    activatedSpecials,
    you,
  } = props
  const { tileLookup } = useTiles(tilesWithUnits)
  const placeableCoordinates =
    useMemo(() => {
      if (!yourTurn || !match || !tilesWithUnits || !participants) {
        return []
      }

      // const isCardWithSingleUnit =
      //   selectedCard?.coordinates.length === 1 &&
      //   coordinatesAreEqual(selectedCard.coordinates[0], [0, 0])

      // if (isCardWithSingleUnit) {
      //   const visibleAndFreeTiles: Coordinate[] = Object.values(tileLookup)
      //     .filter((tile) => tile.visible && !tile.unit && !tile.terrain)
      //     .map((tile) => [tile.row, tile.col])
      //   return visibleAndFreeTiles
      // }

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
            activePlayer,
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
  return { placeableCoordinates }
}
