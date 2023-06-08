import { Map } from "database"

export const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:1337/api"
    : "https://schnoz-web-jakobpesch.vercel.app/api"

export const BASE_API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://schnoz-web-jakobpesch.vercel.app/api"

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
