import { Prisma } from "database";

const matchWithPlayersAndUsers = Prisma.validator<Prisma.MatchArgs>()({
  include: { players: { include: { user: true } } },
});

export type MatchWithPlayersAndUsers = Prisma.MatchGetPayload<
  typeof matchWithPlayersAndUsers
>;
