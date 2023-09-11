export const NEXT_PUBLIC_CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL
export const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL
export const NEXT_PUBLIC_WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL

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
