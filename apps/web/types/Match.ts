import { Prisma } from "database"

const matchWithPlayers = Prisma.validator<Prisma.MatchArgs>()({
  include: { players: true },
})

export type MatchWithPlayers = Prisma.MatchGetPayload<typeof matchWithPlayers>

export const matchRichInclude = {
  players: true,
  map: { include: { tiles: { include: { unit: true } } } },
  activePlayer: { include: { user: { select: { name: true } } } },
  winner: true,
  gameSettings: true,
}

const matchRich = Prisma.validator<Prisma.MatchArgs>()({
  include: matchRichInclude,
})

export type MatchRich = Prisma.MatchGetPayload<typeof matchRich>
