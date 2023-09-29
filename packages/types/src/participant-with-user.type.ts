import { Prisma } from "database"

const participantWithUser = Prisma.validator<Prisma.ParticipantArgs>()({
  include: { user: true },
})

export type ParticipantWithUser = Prisma.ParticipantGetPayload<
  typeof participantWithUser
>
