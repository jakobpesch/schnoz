import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Query,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@sentry/node';
import dotenv from 'dotenv';
import { API_ERROR_CODES } from 'types';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { AuthRequest } from './auth-request.type';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

const { CLIENT_URL, API_URL } = dotenv.config()?.parsed ?? {};

type VerificationTokenSignature = { sub: User['id']; iat: number; exp: number };
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() body: { email: string; password: string }) {
    return this.authService.signIn(body.email, body.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(
    @Req()
    req: AuthRequest,
  ) {
    return req.user;
  }

  @UseGuards(AuthGuard)
  @Post('resend-verification-email')
  async resendVerificationEmail(@Req() req: AuthRequest) {
    console.log('resendVerificationEmail', req);
    if (!req.user.email) {
      throw new BadRequestException(API_ERROR_CODES.EMAIL_NOT_SET);
    }
    let user = await this.usersService.findOne({ id: req.user.sub });

    const isValidVerificationToken =
      !!user.verificationToken &&
      (
        await this.jwtService.verifyAsync<VerificationTokenSignature>(
          user.verificationToken,
        )
      ).exp *
        1000 >
        new Date().getTime();

    if (user.verificationToken === null || !isValidVerificationToken) {
      const verificationToken = this.authService.generateVerificationToken(
        req.user.sub,
      );
      user = await this.usersService.update({
        where: { id: req.user.sub },
        data: { verificationToken },
      });
    }

    const url = `${API_URL}/auth/verify-email?token=${user.verificationToken}`;
    await this.mailService.sendMail({
      to: req.user.email,
      subject: 'Verify your email',
      text: `Please verify your email visiting the following link into your browser: ${url}. It is valid for 24 hours.`,
      html: `<p>Please verify your email by clicking the following link:</p><a href='${url}'>Verify your email</a><p>It is valid for 24 hours.</p>`,
    });
    return { success: true };
  }

  @Get('verify-email')
  @Redirect(`${CLIENT_URL}/auth/verified`)
  async verifyEmail(@Query('token') token: string) {
    console.log('verifyEmail', token);

    if (!token) {
      throw new BadRequestException(API_ERROR_CODES.INVALID_VERIFICATION_TOKEN);
    }
    try {
      const payload =
        await this.jwtService.verifyAsync<VerificationTokenSignature>(token);

      const users = await this.usersService.findMany({
        where: { verificationToken: token },
      });

      if (users.length === 0) {
        throw new BadRequestException(
          API_ERROR_CODES.INVALID_VERIFICATION_TOKEN,
        );
      }
      if (users.length > 1) {
        throw new InternalServerErrorException();
      }
      console.log(new Date(payload.exp * 1000), new Date());
      if (payload.exp * 1000 < new Date().getTime()) {
        throw new BadRequestException(
          API_ERROR_CODES.VERIFICATION_TOKEN_EXPIRED,
        );
      }
      const user = users[0];

      await this.usersService.update({
        where: { id: user.id },
        data: {
          verifiedEmail: new Date().toISOString(),
          verificationToken: null,
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(AuthGuard)
  @Get('refresh')
  async refresh(@Req() req: AuthRequest) {
    const { sub } = req.user;
    const user = await this.usersService.findOne({ id: sub });
    return this.authService.generateToken(user);
  }
}
