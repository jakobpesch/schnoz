import { Match, Participant, UnitType } from "database"
import { useMemo } from "react"
import { Coordinate2D } from "../models/UnitConstellation.model"
import { Special } from "../services/GameManagerService"
import { TileWithUnit } from "../types/Tile"
import { Card } from "../utils/constallationTransformer"
import {
  buildTileLookupId,
  coordinatesAreEqual,
  getAdjacentCoordinatesOfConstellation,
} from "../utils/coordinateUtils"
import { useTiles } from "./useTiles"

export function usePlaceableCoordinates(
  match: Match | undefined,
  tilesWithUnits: TileWithUnit[] | undefined,
  players: Participant[] | undefined,
  yourTurn: boolean,
  selectedCard: Card | null,
  activatedSpecials: Special[]
) {
  const { tileLookup } = useTiles(tilesWithUnits)
  const placeableCoordinates =
    useMemo(() => {
      if (!yourTurn || !match || !tilesWithUnits || !players) {
        return []
      }

      if (
        selectedCard?.coordinates.length === 1 &&
        coordinatesAreEqual(selectedCard.coordinates[0], [0, 0])
      ) {
        const visibleAndFreeTiles: Coordinate2D[] = Object.values(tileLookup)
          .filter((tile) => tile.visible && !tile.unit && !tile.terrain)
          .map((tile) => [tile.row, tile.col])
        return visibleAndFreeTiles
      }

      const alliedTiles =
        tilesWithUnits.filter(
          (tile) =>
            tile.unit?.ownerId === match.activePlayerId ||
            tile?.unit?.type === UnitType.MAIN_BUILDING
        ) ?? []

      let placeableCoordiantes = getAdjacentCoordinatesOfConstellation(
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
          (players.find((player) => player.id === match.activePlayerId)
            ?.bonusPoints ?? 0) +
            (selectedCard?.value ?? 0) >=
            special.cost
        )
      })
      if (usesSpecial) {
        placeableCoordiantes = [
          ...placeableCoordiantes,
          ...getAdjacentCoordinatesOfConstellation(placeableCoordiantes).filter(
            (coordinate) => {
              const hasTerrain =
                tileLookup[buildTileLookupId(coordinate)]?.terrain ?? false
              const hasUnit =
                tileLookup[buildTileLookupId(coordinate)]?.unit ?? false
              return !hasTerrain && !hasUnit
            }
          ),
        ]
      }
      return placeableCoordiantes
    }, [match, tilesWithUnits, selectedCard, activatedSpecials]) ?? []
  return { placeableCoordinates }
}
