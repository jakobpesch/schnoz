import dotenv from "dotenv"

export const BASE_URL = dotenv.config()?.parsed?.URL ?? "http://localhost:3000"
export const BASE_API_URL = BASE_URL + "/api"

export const SPECIAL_TYPES = ["EXPAND_BUILD_RADIUS_BY_1"] as const
export type SpecialType = (typeof SPECIAL_TYPES)[number]

export interface Special {
  cost: number
  type: SpecialType
}

export const expandBuildRadiusByOne: Special = {
  type: "EXPAND_BUILD_RADIUS_BY_1",
  cost: 5,
}
