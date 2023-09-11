import { GameSettings, Match } from "database"

export function isLastTurn(match: Match, gameSettings: GameSettings) {
  return match.turn >= (gameSettings.maxTurns ?? 0)
}
