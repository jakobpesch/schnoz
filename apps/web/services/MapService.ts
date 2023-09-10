import { Map, Match } from "database"
import { fetchApi } from "./FetchService"
import { NEXT_PUBLIC_API_URL } from "./GameManagerService"

export const createMap = async (matchId: Match["id"]) => {
  return fetchApi<Map>({
    url: `${NEXT_PUBLIC_API_URL}/maps`,
    method: "POST",
    body: { matchId },
  })
}
