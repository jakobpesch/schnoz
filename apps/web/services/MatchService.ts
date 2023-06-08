import { MatchWithPlayers, MatchWithPlayersAndUsers } from "types"
import { fetchApi } from "./FetchService"
import { BASE_API_URL } from "./GameManagerService"
import { Match } from "database"

export const createMatch = async () => {
  return fetchApi<MatchWithPlayers>({
    url: `${BASE_API_URL}/matches`,
    method: "POST",
  })
}
export const deleteMatch = async (matchId: string) => {
  return fetchApi<Match>({
    url: `${BASE_API_URL}/matches`,
    method: "DELETE",
    body: { id: matchId },
  })
}

export const joinMatch = async (matchId: string) => {
  return fetchApi<Match>({
    url: `${BASE_API_URL}/matches/${matchId}/join`,
    method: "PUT",
  })
}

export const fetchMatchList = async () => {
  return fetchApi<MatchWithPlayersAndUsers[]>({
    url: `${BASE_API_URL}/matches/list?sort=desc`,
  })
}
