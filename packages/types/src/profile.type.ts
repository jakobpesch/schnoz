import { User } from "database"

export type Profile = {
  sub: string
  email: string
  name: string
  friendCode: User["friendCode"]
  verifiedEmail: string
}
