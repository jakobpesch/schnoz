import { Prisma } from "database"
import { matchRich } from "./match-rich.const"

export type MatchRich = Prisma.MatchGetPayload<typeof matchRich>
