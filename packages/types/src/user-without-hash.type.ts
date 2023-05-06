import { Prisma } from "database";

const userWithoutHash = Prisma.validator<Prisma.UserArgs>()({
  select: {
    id: true,
    email: true,
    name: true,
  },
});

export type UserWithoutHash = Prisma.UserGetPayload<typeof userWithoutHash>;
