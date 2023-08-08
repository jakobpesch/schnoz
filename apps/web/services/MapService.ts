import { MatchWithPlayers, MatchWithPlayersAndUsers } from "types"
import { fetchApi } from "./FetchService"
import { BASE_API_URL } from "./GameManagerService"
import { Map, Match } from "database"

export const createMap = async (matchId: Match["id"]) => {
  return fetchApi<Map>({
    url: `${BASE_API_URL}/maps`,
    method: "POST",
    body: { matchId },
  })
}
