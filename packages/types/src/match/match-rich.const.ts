import { Prisma } from "database"

export const matchRich = Prisma.validator<Prisma.MatchArgs>()({
  include: {
    players: true,
    map: { include: { tiles: { include: { unit: true } } } },
    activePlayer: { include: { user: { select: { name: true } } } },
    winner: true,
    gameSettings: true,
  },
})
