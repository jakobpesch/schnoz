import { Match, MatchStatus } from "database"

export const useMatchStatus = (status: Match["status"] | undefined) => {
  const isPreMatch = status === MatchStatus.CREATED
  const wasStarted =
    status === MatchStatus.STARTED || status === MatchStatus.FINISHED
  const isOngoing = status === MatchStatus.STARTED
  const isFinished = status === MatchStatus.FINISHED
  return {
    isPreMatch,
    wasStarted,
    isOngoing,
    isFinished,
  }
}
