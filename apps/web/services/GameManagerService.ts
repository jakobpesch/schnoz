export const BASE_API_URL = "http://localhost:3000"

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
