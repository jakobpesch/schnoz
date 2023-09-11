import { Prisma } from "database"

const tileRich = Prisma.validator<Prisma.TileArgs>()({
  include: {
    unit: true,
  },
})

export type TileWithUnit = Prisma.TileGetPayload<typeof tileRich>
