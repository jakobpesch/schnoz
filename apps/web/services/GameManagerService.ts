import { GameSettings, Map, Match, MatchStatus, Participant } from "database"
import { defaultGame } from "../gameLogic/GameVariants"
import { adjacentToAlly2, PlacementRuleName } from "../gameLogic/PlacementRule"
import {
  Coordinate2D,
  IUnitConstellation,
} from "../models/UnitConstellation.model"
import { MapWithTiles } from "../types/Map"
import { MatchRich, MatchWithPlayers } from "../types/Match"
import { TileWithUnit } from "../types/Tile"
import {
  transformCoordinates,
  translateCoordinatesTo,
} from "../utils/constallationTransformer"
import { buildTileLookupId, TileLookup } from "../utils/coordinateUtils"
import { setCookie } from "./CookieService"
import { fetcher } from "./swrUtils"

export const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:1337/api"
    : "https://schnoz-web-jakobpesch.vercel.app/api"

export const signInAnonymously = async () => {
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  }
  try {
    const user = await fetcher(BASE_URL + "/users", options)
    setCookie("userId", user.id, 30)
    return user
  } catch (e) {
    throw e
  }
}

export const updateUser = async (
  userId: string,
  payload: {
    email: string
    name: string
    password: string
  }
) => {
  const options = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }

  const response = await fetch(BASE_URL + "/user/" + userId, options)

  if (response.status !== 200) {
    throw new Error("Failed to update user")
  }

  return await response.json()
}
export const login = async (payload: { email: string; password: string }) => {
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }

  const response = await fetch(BASE_URL + "/user/login", options)

  if (response.status !== 200) {
    throw new Error("Login failed", {
      cause: { status: response.status, message: await response.text() },
    })
  }

  return await response.json()
}

export const getMatches = async () => {
  const options = {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }

  const response = await fetch(BASE_URL + "/matches", options)

  if (response.status !== 200) {
    throw new Error("Failed to get matches")
  }

  return await response.json()
}

export const startMatch = async (matchId: string, userId: string) => {
  const options = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "start",
      userId,
    }),
  }

  const response = await fetch(BASE_URL + "/match/" + matchId, options)
  if (response.status !== 200) {
    throw new Error("Failed to start match")
  }

  return await response.json()
}

export const createMap = async (
  matchId: string,
  userId: string
): Promise<Map> => {
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      matchId,
    }),
  }

  const response = await fetch(BASE_URL + "/maps", options)

  if (response.status !== 201) {
    throw new Error("Failed to create map")
  }

  return await response.json()
}

export const joinMatch = async (matchId: string, userId: string) => {
  const options = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "join",
      userId,
    }),
  }

  const response = await fetch(BASE_URL + "/match/" + matchId, options)

  if (response.status !== 200) {
    throw new Error("Failed to join match")
  }

  return await response.json()
}

export const createMatch = async (userId: string) => {
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
    }),
  }

  const response = await fetch(BASE_URL + "/matches", options)

  if (response.status !== 201) {
    throw new Error("Failed to create match")
  }
  const match: MatchWithPlayers = await response.json()
  return match
}

export const updateSettings: (args: {
  matchId: Match["id"]
  userId: Participant["userId"]
  mapSize: GameSettings["mapSize"]
  rules: GameSettings["rules"]
  maxTurns: GameSettings["maxTurns"]
  waterRatio: GameSettings["waterRatio"]
  stoneRatio: GameSettings["stoneRatio"]
  treeRatio: GameSettings["treeRatio"]
}) => Promise<MatchRich> = async (props) => {
  const options = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: props.userId,
      mapSize: props.mapSize,
      rules: props.rules,
      maxTurns: props.maxTurns,
      waterRatio: props.waterRatio,
      stoneRatio: props.stoneRatio,
      treeRatio: props.treeRatio,
    }),
  }

  const response = await fetch(
    BASE_URL + "/match/" + props.matchId + "/settings",
    options
  )

  if (response.status !== 201) {
    throw new Error("Failed to update settings")
  }

  return await response.json()
}

export const deleteMatch = async (matchId: string, userId: string) => {
  const options = {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      matchId,
    }),
  }

  const response = await fetch(BASE_URL + "/match/" + matchId, options)

  if (response.status !== 200) {
    throw new Error("Failed to delete match")
  }

  return await response.json()
}

export const checkForMatchUpdates = async (matchId: string, time: Date) => {
  const options = {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }

  const response = await fetch(
    BASE_URL + "/match/" + matchId + "/check?time=" + time,
    options
  )

  if (response.status === 304) {
    return null
  }

  const updatedMatch: MatchRich = (await response.json()).match

  return updatedMatch
}

export const getMatch = async (matchId: string) => {
  const options = {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }

  const response = await fetch(BASE_URL + "/match/" + matchId, options)

  if (response.status !== 200) {
    throw new Error("Failed to create match")
  }

  const match: MatchRich = await response.json()

  return match
}

export const getMap = () => {
  console.log("getMap not yet implemented")
}

export const SPECIAL_TYPES = ["EXPAND_BUILD_RADIUS_BY_1"] as const
export type SpecialType = typeof SPECIAL_TYPES[number]

export interface Special {
  cost: number
  type: SpecialType
}

export const expandBuildRadiusByOne: Special = {
  type: "EXPAND_BUILD_RADIUS_BY_1",
  cost: 5,
}

export const makeMove = async (
  matchId: string,
  row: number,
  col: number,
  participantId: string,
  unitConstellation: IUnitConstellation,
  ignoredRules?: PlacementRuleName[],
  specials?: Special[]
) => {
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      participantId,
      row,
      col,
      unitConstellation,
      ignoredRules,
      specials,
    }),
  }

  const response = await fetch(
    BASE_URL + "/match/" + matchId + "/moves",
    options
  )

  if (response.status !== 201) {
    throw new Error(await response.text())
  }
  const updatedMatch: MatchRich = await response.json()
  return updatedMatch
}

export const checkConditionsForUnitConstellationPlacement = (
  targetCoordinate: Coordinate2D,
  unitConstellation: IUnitConstellation,
  match: Match | undefined,
  activePlayer: Participant | undefined,
  map: Map | undefined,
  tilesWithUnits: TileWithUnit[] | undefined,
  tileLookup: TileLookup,
  ignoredRules: PlacementRuleName[],
  placingPlayer: Participant["id"] | undefined,
  specials: Special[]
) => {
  if (!match) {
    return { error: { message: "Could not find match", statusCode: 400 } }
  }

  if (!map) {
    return { error: { message: "Map is missing", statusCode: 500 } }
  }
  if (!tilesWithUnits) {
    return {
      error: { message: "Tiles with units are missing", statusCode: 500 },
    }
  }

  if (match.status !== MatchStatus.STARTED) {
    return { error: { message: "Match is not started", statusCode: 400 } }
  }

  if (match.activePlayerId !== placingPlayer) {
    return { error: { message: "It's not your turn", statusCode: 400 } }
  }

  const targetTile = tileLookup[buildTileLookupId(targetCoordinate)]

  if (!targetTile) {
    return { error: { message: "Could not find target tile", statusCode: 400 } }
  }

  const { coordinates, rotatedClockwise, mirrored } = unitConstellation

  const transformedCoordinates = transformCoordinates(coordinates, {
    rotatedClockwise,
    mirrored,
  })

  const translatedCoordinates = translateCoordinatesTo(
    targetCoordinate,
    transformedCoordinates
  )

  if (
    specials.some(
      (special) =>
        (special.type === "EXPAND_BUILD_RADIUS_BY_1" &&
          activePlayer?.bonusPoints) ??
        0 + unitConstellation.value >= expandBuildRadiusByOne.cost
    )
  ) {
    defaultGame.placementRuleMap.delete("ADJACENT_TO_ALLY")
    defaultGame.placementRuleMap.set("ADJACENT_TO_ALLY_2", adjacentToAlly2)
  }

  const canBePlaced = Array.from(defaultGame.placementRuleMap).every(
    ([ruleName, rule]) =>
      ignoredRules.includes(ruleName)
        ? true
        : rule(translatedCoordinates, map, tilesWithUnits, placingPlayer)
  )

  if (!canBePlaced) {
    return {
      error: {
        message: "Cannot be placed due to a placement rule",
        statusCode: 400,
      },
    }
  }

  return { translatedCoordinates }
}
