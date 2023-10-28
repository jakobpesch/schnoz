import { getTileLookup } from "coordinate-utils"
import {
  GameSettings,
  Match,
  Participant,
  Rule,
  Map as SchnozMap,
  Unit,
  User,
} from "database"
import { createCustomGame } from "game-logic"
import { produce } from "immer"
import {
  Card,
  Coordinate,
  ParticipantWithUser,
  Profile,
  RuleEvaluation,
  TileWithUnit,
} from "types"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export type AnimationObject = {
  id: string
  position: Coordinate
}
export type FulFillmentDifference = Record<
  Participant["id"],
  Record<
    Rule,
    {
      plus: RuleEvaluation["fulfillments"]
      minus: RuleEvaluation["fulfillments"]
    }
  >
>
type MatchStoreState = {
  profile: Profile | null
  match: Match | null
  participants: ParticipantWithUser[] | null
  fulfillmentDifference: FulFillmentDifference | null
  map: SchnozMap | null
  tilesWithUnits: TileWithUnit[] | null
  updatedTilesWithUnits: TileWithUnit[] | null
  gameSettings: GameSettings | null
  connectedParticipants: ParticipantWithUser[] | null
  hoveredCoordinate: Coordinate | null
  opponentsHoveredCoordinates: Coordinate[] | null
  showRuleEvaluationHighlights: Coordinate[] | null
  selectedCard: Card | null
  animationObjects: Record<AnimationObject["id"], AnimationObject>
  placeableCoordinates: Coordinate[] | null
}

type MatchStoreGetters = {
  userId: () => User["id"] | null
  activeParticipant: () => ParticipantWithUser | null
  getParticipant: (
    playerNumber: Participant["playerNumber"],
  ) => ParticipantWithUser | null
  isParticipantConnected: (playerNumber: Participant["playerNumber"]) => boolean
  yourTurn: () => boolean
  you: () => ParticipantWithUser | null
  getEvaluationsMap: () => Map<Rule, RuleEvaluation[]> | null
}

type MatchStore = MatchStoreState & MatchStoreGetters

const initialStoreState: MatchStoreState = {
  profile: null,
  match: null,
  participants: null,
  fulfillmentDifference: null,
  map: null,
  tilesWithUnits: null,
  gameSettings: null,
  updatedTilesWithUnits: null,
  connectedParticipants: null,
  hoveredCoordinate: null,
  opponentsHoveredCoordinates: null,
  showRuleEvaluationHighlights: null,
  selectedCard: null,
  animationObjects: {},
  placeableCoordinates: null,
}

export const useMatchStore = create<MatchStore>()(
  persist(
    (set, get) => ({
      ...initialStoreState,
      userId: () => get().profile?.sub ?? null,
      activeParticipant: () =>
        get().participants?.find(
          (player) => player.id === get().match?.activePlayerId,
        ) ?? null,
      yourTurn: () => get().userId() === get().activeParticipant()?.userId,
      you: () =>
        get().participants?.find(
          (player) => player.userId === get().userId(),
        ) ?? null,
      getParticipant: (playerNumber: Participant["playerNumber"]) =>
        get().participants?.find(
          (participant) => participant.playerNumber === playerNumber,
        ) ?? null,
      isParticipantConnected: (playerNumber: Participant["playerNumber"]) =>
        get().connectedParticipants?.some(
          (participant) => participant.playerNumber === playerNumber,
        ) ?? false,
      getEvaluationsMap: () => {
        const gameSettings = get().gameSettings
        const participants = get().participants
        const tilesWithUnits = get().tilesWithUnits

        if (!gameSettings || !participants || !tilesWithUnits) {
          return null
        }

        const tileLookup = getTileLookup(tilesWithUnits)

        const rulesMap = new Map<Rule, RuleEvaluation[]>()

        const gameType = createCustomGame(gameSettings)

        gameType.scoringRules.forEach((rule) => {
          const evals = participants
            .sort((a, b) => a.playerNumber - b.playerNumber)
            .map((participant) => rule(participant.id, tileLookup))
          rulesMap.set(evals[0].type, evals)
        })
        return rulesMap
      },
    }),
    { name: "schnoz-match-storage" },
  ),
)

export const setProfile = (profile: Profile | null) => {
  useMatchStore.setState((state) => ({ profile }))
}

export const setMatch = (match: Match | null) => {
  useMatchStore.setState((state) => ({ match }))
}
export const setParticipants = (participants: ParticipantWithUser[] | null) => {
  useMatchStore.setState((state) => ({ participants }))
}
export const setFulfillments = (
  fulfillmentDifference: FulFillmentDifference | null,
) => {
  useMatchStore.setState((state) => ({ fulfillmentDifference }))
}
export const setMap = (map: SchnozMap | null) => {
  useMatchStore.setState((state) => ({ map }))
}
export const setPlaceableCoordinates = (
  placeableCoordinates: Coordinate[] | null,
) => {
  useMatchStore.setState((state) => ({ placeableCoordinates }))
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
  useMatchStore.setState((state) => ({
    connectedParticipants: connectedPlayers,
  }))
}
export const setOpponentsHoveredCoordinates = (
  opponentsHoveredCoordinates: Coordinate[] | null,
) => {
  useMatchStore.setState((state) => ({ opponentsHoveredCoordinates }))
}
export const addAnimationObject = (animationObject: AnimationObject) => {
  useMatchStore.setState((state) => ({
    animationObjects: {
      ...state.animationObjects,
      [animationObject.id]: animationObject,
    },
  }))
}
export const removeAnimationObject = (
  animationObjectId: AnimationObject["id"],
) => {
  useMatchStore.setState((state) =>
    produce(state, (draft) => {
      delete draft.animationObjects[animationObjectId]
    }),
  )
}
export const setShowRuleEvaluationHighlights = (
  showRuleEvaluationHighlights: Coordinate[] | null,
) => {
  useMatchStore.setState((state) => ({ showRuleEvaluationHighlights }))
}
export const setHoveredCoordinate = (hoveredCoordinate: Coordinate | null) => {
  useMatchStore.setState((state) => ({ hoveredCoordinate }))
}
export const setSelectedCard = (selectedCard: Card | null) => {
  useMatchStore.setState((state) => ({ selectedCard }))
}

export const isUsersUnit = (unit: Unit) => {
  const userId = useMatchStore.getState().profile?.sub
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
