import { Prisma } from "database"

const mapWithTiles = Prisma.validator<Prisma.MapArgs>()({
  include: { tiles: { include: { unit: true } } },
})

export type MapWithTiles = Prisma.MapGetPayload<typeof mapWithTiles>
