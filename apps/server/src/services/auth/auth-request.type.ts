import { User } from "database"
import { Request } from "express"

export type AuthRequest = Request & {
  user: {
    email: string | null
    name: string
    friendCode: User["friendCode"]
    verifiedEmail: string
    sub: string
    iat: number
    exp: number
  }
}
