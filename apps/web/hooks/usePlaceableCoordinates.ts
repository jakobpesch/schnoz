import {
  Card,
  buildTileLookupId,
  coordinatesAreEqual,
  getAdjacentCoordinatesOfConstellation,
} from "coordinate-utils"
import { Map, Match, Participant, UnitConstellation, UnitType } from "database"
import { useMemo } from "react"
import { Coordinate, TileWithUnit } from "types"
import { Special } from "../services/GameManagerService"
import { useTiles } from "./useTiles"
import { checkConditionsForUnitConstellationPlacement } from "game-logic"

export function usePlaceableCoordinates(props: {
  match: Match | undefined
  map: Map | undefined
  activePlayer: Participant | undefined
  tilesWithUnits: TileWithUnit[] | undefined
  participants: Participant[] | undefined
  yourTurn: boolean
  selectedCard: Card | null
  activatedSpecials: Special[]
  you: Participant | undefined
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
            tileLookup,
            [],
            you?.id,
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
