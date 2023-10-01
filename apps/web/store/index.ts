import { GameSettings, Map, Match, Participant, Unit } from "database"
import {
  Card,
  Coordinate,
  ParticipantWithUser,
  Profile,
  TileWithUnit,
} from "types"
import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

interface AuthState {
  profile: Profile | null
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        profile: null,
      }),
      {
        name: "auth-storage",
      },
    ),
  ),
)

export const setProfile = (profile: Profile | null) => {
  useAuthStore.setState((state) => ({ profile }))
}
interface MatchState {
  match: Match | null
  participants: ParticipantWithUser[] | null
  map: Map | null
  tilesWithUnits: TileWithUnit[] | null
  updatedTilesWithUnits: TileWithUnit[] | null
  gameSettings: GameSettings | null
  connectedPlayers: ParticipantWithUser[] | null
  hoveredCoordinate: Coordinate | null
  opponentsHoveredCoordinates: Coordinate[] | null
  selectedCard: Card | null
}

export const useMatchStore = create<MatchState>()(
  devtools(
    persist(
      (set, get) => ({
        match: null,
        participants: null,
        map: null,
        tilesWithUnits: null,
        gameSettings: null,
        updatedTilesWithUnits: null,
        connectedPlayers: null,
        hoveredCoordinate: null,
        opponentsHoveredCoordinates: null,
        selectedCard: null,
      }),
      {
        name: "match-storage",
      },
    ),
  ),
)

export const setMatch = (match: Match | null) => {
  useMatchStore.setState((state) => ({ match }))
}
export const setParticipants = (participants: ParticipantWithUser[] | null) => {
  useMatchStore.setState((state) => ({ participants }))
}
export const setMap = (map: Map | null) => {
  useMatchStore.setState((state) => ({ map }))
}
export const setTilesWithUnits = (tilesWithUnits: TileWithUnit[] | null) => {
  useMatchStore.setState((state) => ({ tilesWithUnits }))
}
export const setUpdatedTilesWithUnits = (
  updatedTilesWithUnits: TileWithUnit[] | null,
) => {
  useMatchStore.setState((state) => ({ updatedTilesWithUnits }))
}
export const setGameSettings = (gameSettings: GameSettings | null) => {
  useMatchStore.setState((state) => ({ gameSettings }))
}
export const setConnectedParticipants = (
  connectedPlayers: ParticipantWithUser[] | null,
) => {
  useMatchStore.setState((state) => ({ connectedPlayers }))
}
export const setOpponentsHoveredCoordinates = (
  opponentsHoveredCoordinates: Coordinate[] | null,
) => {
  useMatchStore.setState((state) => ({ opponentsHoveredCoordinates }))
}
export const setHoveredCoordinate = (hoveredCoordinate: Coordinate | null) => {
  useMatchStore.setState((state) => ({ hoveredCoordinate }))
}
export const setSelectedCard = (selectedCard: Card | null) => {
  useMatchStore.setState((state) => ({ selectedCard }))
}

export const isUsersUnit = (unit: Unit) => {
  const userId = useAuthStore.getState().profile?.sub
  const participants = useMatchStore.getState().participants
  const usersParticipantId = participants?.find(
    (participant) => participant.userId === userId,
  )?.id
  return unit.ownerId === usersParticipantId
}

export const getPlayerNumber = (participantId: Participant["id"] | null) => {
  return useMatchStore
    .getState()
    .participants?.find((p) => p.id === participantId)?.playerNumber
}
