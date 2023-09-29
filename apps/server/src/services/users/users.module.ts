import { Module } from "@nestjs/common"
import { AuthService } from "../auth/auth.service"
import { MailService } from "../mail/mail.service"
import { MatchesService } from "../matches/matches.service"
import { PrismaService } from "../prisma/prisma.service"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    PrismaService,
    AuthService,
    MatchesService,
    MailService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
