import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { MailService } from "../mail/mail.service"
import { UsersModule } from "../users/users.module"
import { jwtConstants } from "./auth.constants"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
// import { jwtConstants } from './auth.constants';
// import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "1d" }, // 1day
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService],
  exports: [AuthService],
})
export class AuthModule {}
