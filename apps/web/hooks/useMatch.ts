import { coordinatesAreEqual } from "coordinate-utils"
import { GameSettings, Match, Map as SchnozMap, User } from "database"
import { useEffect, useState } from "react"
import { ParticipantWithUser, TileWithUnit } from "types"
import { socketApi } from "../services/SocketService"

export function useMatch(userId: User["id"], matchId: Match["id"]) {
  const [match, setMatch] = useState<Match>()
  const [gameSettings, setGameSettings] = useState<GameSettings>()
  const [map, setMap] = useState<SchnozMap>()
  const [updatedTilesWithUnits, setUpdatedTilesWithUnits] =
    useState<TileWithUnit[]>()
  const [tilesWithUnits, setTilesWithUnits] = useState<TileWithUnit[]>()
  const [participants, setParticipants] = useState<ParticipantWithUser[]>()
  const [connectedParticipants, setConnectedParticipants] =
    useState<ParticipantWithUser[]>()

  useEffect(() => {
    if (!updatedTilesWithUnits || !tilesWithUnits) {
      return
    }
    const tilesWithUnitsClone = [...tilesWithUnits]
    updatedTilesWithUnits.forEach((updatedTileWithUnit) => {
      const index = tilesWithUnits?.findIndex((t) =>
        coordinatesAreEqual(
          [t.row, t.col],
          [updatedTileWithUnit.row, updatedTileWithUnit.col],
        ),
      )
      if (!index) {
        tilesWithUnitsClone.push(updatedTileWithUnit)
        return
      }
      tilesWithUnitsClone[index] = updatedTileWithUnit
    })
    setTilesWithUnits(tilesWithUnitsClone)
  }, [updatedTilesWithUnits])

  return {
    match,
    gameSettings,
    map,
    tilesWithUnits,
    updatedTilesWithUnits,
    participants,
    connectedParticipants,
  }
}
