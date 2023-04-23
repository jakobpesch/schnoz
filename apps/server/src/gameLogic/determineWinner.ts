import { GameSettings, Match, Participant } from 'database';
import { getLeadingPlayer } from './getLeadingPlayer';
import { isLastTurn } from './isLastTurn';

const maxScore = 5;

export function determineWinner(
  match: Match,
  gameSettings: GameSettings,
  players: Participant[],
) {
  const leadingPlayer = getLeadingPlayer(players);
  if (!leadingPlayer) {
    return null;
  }
  if (leadingPlayer.score >= maxScore) {
    return leadingPlayer;
  }
  if (!isLastTurn(match, gameSettings)) {
    return null;
  }
  return leadingPlayer;
}
