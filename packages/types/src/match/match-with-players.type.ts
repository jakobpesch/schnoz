import { Prisma } from "database"

const matchWithPlayers = Prisma.validator<Prisma.MatchArgs>()({
  include: { players: true },
})

export type MatchWithPlayers = Prisma.MatchGetPayload<typeof matchWithPlayers>
