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

      const isCardWithSingleUnit =
        selectedCard?.coordinates.length === 1 &&
        coordinatesAreEqual(selectedCard.coordinates[0], [0, 0])

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
            activatedSpecials
          )
        )
        .filter((v) => typeof v.error === "undefined")
        .map((v) => v.translatedCoordinates?.[0] ?? null)
        .filter(Boolean)
      console.log(placeableCoordiantes)

      return placeableCoordiantes

      const alliedTiles =
        tilesWithUnits.filter(
          (tile) =>
            tile.unit?.ownerId === match.activePlayerId ||
            tile?.unit?.type === UnitType.MAIN_BUILDING
        ) ?? []

      let placeableCoordiantes2 = getAdjacentCoordinatesOfConstellation(
        alliedTiles.map((tile) => [tile.row, tile.col])
      ).filter((coordinate) => {
        const hasTerrain =
          tileLookup[buildTileLookupId(coordinate)]?.terrain ?? false
        const hasUnit = tileLookup[buildTileLookupId(coordinate)]?.unit ?? false
        return !hasTerrain && !hasUnit
      })

      const usesSpecial = activatedSpecials.find((special) => {
        return (
          special.type === "EXPAND_BUILD_RADIUS_BY_1" &&
          (participants.find((player) => player.id === match.activePlayerId)
            ?.bonusPoints ?? 0) +
            (selectedCard?.value ?? 0) >=
            special.cost
        )
      })
      if (usesSpecial) {
        placeableCoordiantes2 = [
          ...placeableCoordiantes,
          ...getAdjacentCoordinatesOfConstellation(
            placeableCoordiantes2
          ).filter((coordinate) => {
            const hasTerrain =
              tileLookup[buildTileLookupId(coordinate)]?.terrain ?? false
            const hasUnit =
              tileLookup[buildTileLookupId(coordinate)]?.unit ?? false
            return !hasTerrain && !hasUnit
          }),
        ]
      }
      return placeableCoordiantes2
    }, [match, tilesWithUnits, selectedCard, activatedSpecials]) ?? []
  return { placeableCoordinates }
}
