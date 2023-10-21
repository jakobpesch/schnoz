import { GameSettings, Map, Match, Participant, Unit, User } from "database"
import {
  Card,
  Coordinate,
  ParticipantWithUser,
  Profile,
  TileWithUnit,
} from "types"
import { create } from "zustand"

interface Store {
  profile: Profile | null
  userId: () => User["id"] | null
  match: Match | null
  participants: ParticipantWithUser[] | null
  map: Map | null
  tilesWithUnits: TileWithUnit[] | null
  updatedTilesWithUnits: TileWithUnit[] | null
  gameSettings: GameSettings | null
  connectedPlayers: ParticipantWithUser[] | null
  hoveredCoordinate: Coordinate | null
  opponentsHoveredCoordinates: Coordinate[] | null
  showRuleEvaluationHighlights: Coordinate[] | null
  selectedCard: Card | null
  activeParticipant: () => ParticipantWithUser | null
  yourTurn: () => boolean
  you: () => ParticipantWithUser | null
}

export const useStore = create<Store>((set, get) => ({
  profile: null,
  userId: () => get().profile?.sub ?? null,
  match: null,
  participants: null,
  map: null,
  tilesWithUnits: null,
  gameSettings: null,
  updatedTilesWithUnits: null,
  connectedPlayers: null,
  hoveredCoordinate: null,
  opponentsHoveredCoordinates: null,
  showRuleEvaluationHighlights: null,
  selectedCard: null,
  activeParticipant: () =>
    get().participants?.find(
      (player) => player.id === get().match?.activePlayerId,
    ) ?? null,
  yourTurn: () => get().userId() === get().activeParticipant()?.userId,
  you: () =>
    get().participants?.find((player) => player.userId === get().userId()) ??
    null,
}))

export const setProfile = (profile: Profile | null) => {
  useStore.setState((state) => ({ profile }))
}

export const setMatch = (match: Match | null) => {
  useStore.setState((state) => ({ match }))
}
export const setParticipants = (participants: ParticipantWithUser[] | null) => {
  useStore.setState((state) => ({ participants }))
}
export const setMap = (map: Map | null) => {
  useStore.setState((state) => ({ map }))
}
export const setTilesWithUnits = (tilesWithUnits: TileWithUnit[] | null) => {
  useStore.setState((state) => ({ tilesWithUnits }))
}
export const setUpdatedTilesWithUnits = (
  updatedTilesWithUnits: TileWithUnit[] | null,
) => {
  useStore.setState((state) => ({ updatedTilesWithUnits }))
}
export const setGameSettings = (gameSettings: GameSettings | null) => {
  useStore.setState((state) => ({ gameSettings }))
}
export const setConnectedParticipants = (
  connectedPlayers: ParticipantWithUser[] | null,
) => {
  useStore.setState((state) => ({ connectedPlayers }))
}
export const setOpponentsHoveredCoordinates = (
  opponentsHoveredCoordinates: Coordinate[] | null,
) => {
  useStore.setState((state) => ({ opponentsHoveredCoordinates }))
}
export const setShowRuleEvaluationHighlights = (
  showRuleEvaluationHighlights: Coordinate[] | null,
) => {
  useStore.setState((state) => ({ showRuleEvaluationHighlights }))
}
export const setHoveredCoordinate = (hoveredCoordinate: Coordinate | null) => {
  useStore.setState((state) => ({ hoveredCoordinate }))
}
export const setSelectedCard = (selectedCard: Card | null) => {
  useStore.setState((state) => ({ selectedCard }))
}

export const isUsersUnit = (unit: Unit) => {
  const userId = useStore.getState().profile?.sub
  const participants = useStore.getState().participants
  const usersParticipantId = participants?.find(
    (participant) => participant.userId === userId,
  )?.id
  return unit.ownerId === usersParticipantId
}

export const getPlayerNumber = (participantId: Participant["id"] | null) => {
  return useStore.getState().participants?.find((p) => p.id === participantId)
    ?.playerNumber
}
