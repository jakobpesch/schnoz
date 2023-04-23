import { Participant } from 'database';

export function getLeadingPlayer(players: Participant[]) {
  const isSameScore = players.every(
    (player) => player.score === players[0].score,
  );

  if (isSameScore) {
    return null;
  }
  return (
    [...players]
      .sort((p1, p2) => {
        if (p1.score > p2.score) {
          return -1;
        } else {
          return 1;
        }
      })
      .shift() ?? null
  );
}
