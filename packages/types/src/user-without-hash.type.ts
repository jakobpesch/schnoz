import { Prisma } from "database"

const userWithoutHash = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: {
    id: true,
    email: true,
    friendCode: true,
    verifiedEmail: true,
    name: true,
  },
})

export type UserWithoutHash = Prisma.UserGetPayload<typeof userWithoutHash>
