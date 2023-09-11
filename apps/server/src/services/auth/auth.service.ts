import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import bcrypt from "bcrypt"
import { User } from "database"
import { UsersService } from "src/services/users/users.service"
import { UserWithoutHash } from "types"

export type AuthTokenSignature = {
  email: User["email"]
  name: User["name"]
  friendCode: User["friendCode"]
  verifiedEmail: User["verifiedEmail"]
  sub: User["id"]
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUserCreds(email: string, password: string) {
    const user = await this.usersService.findOneWithHash({ email })

    if (!user?.hash) {
      throw new BadRequestException()
    }

    if (!(await bcrypt.compare(password, user.hash))) {
      throw new UnauthorizedException()
    }

    return user
  }

  generateToken(user: UserWithoutHash) {
    const signature: AuthTokenSignature = {
      email: user.email,
      name: user.name,
      friendCode: user.friendCode,
      verifiedEmail: user.verifiedEmail,
      sub: user.id,
    }
    return {
      access_token: this.jwtService.sign(signature),
    }
  }

  async signIn(email: string, providedPassword: string) {
    const user = await this.validateUserCreds(email, providedPassword)
    return this.generateToken(user)
  }

  public generateVerificationToken(userId: User["id"]) {
    return this.jwtService.sign({
      sub: userId,
    })
  }
}
