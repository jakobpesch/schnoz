import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { User } from 'database';
import { API_ERROR_CODES } from 'types';
import { AuthRequest } from '../auth/auth-request.type';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';
import { MatchesService } from '../matches/matches.service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly matchesService: MatchesService,
  ) {}

  @Post('/register/guest')
  async registerGuestUser() {
    const guestUser = await this.usersService.createGuestUser();
    return this.authService.generateToken(guestUser);
  }

  @HttpCode(HttpStatus.OK)
  @Put('/register')
  async register(
    @Body()
    body: {
      id?: User['id'];
      email: string;
      password: string;
      name: string;
    },
  ) {
    const { id, email, password, name } = body;

    if (name.length < 3) {
      throw new BadRequestException('Name must be at least 3 characters');
    }

    if (email.match(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/) === null) {
      throw new BadRequestException(API_ERROR_CODES.INVALID_EMAIL);
    }

    let guestUserId = id;
    if (!guestUserId) {
      const guestUser = await this.usersService.createGuestUser();
      guestUserId = guestUser.id;
    }

    const registeredUser = await this.usersService.register({
      guestUserId,
      email,
      name,
      password,
    });

    const verificationToken = this.authService.generateVerificationToken(
      registeredUser.id,
    );
    const registeredUserWithVerificationToken = await this.usersService.update({
      where: { id: registeredUser.id },
      data: { verificationToken },
    });

    if (!registeredUser.email) {
      throw new InternalServerErrorException(API_ERROR_CODES.EMAIL_NOT_SET);
    }

    const url = `${process.env.API_URL}/auth/verify-email?token=${registeredUserWithVerificationToken.verificationToken}`;
    this.mailService.sendMail({
      to: registeredUser.email,
      subject: 'Welcome to the game!',
      text: `Welcome to the game, ${registeredUser.name}!`,
      html: `<p>Welcome to the game, ${registeredUser.name}!</p>\
             <p>Click <a href="${url}">here</a> to verify your email address.</p>`,
    });

    return this.authService.generateToken(registeredUser);
  }

  @UseGuards(AuthGuard)
  @Post('/add-friend/:friendCode')
  async requestFriendship(
    @Req() req: AuthRequest,
    @Param('friendCode') friendCode: User['friendCode'],
  ) {
    const requestingUserId = req.user.sub;
    try {
      const user = await this.usersService.addFriend({
        requestingUserId,
        friendCode,
      });
      return { user };
    } catch (error: any) {
      const RECORD_TO_UPDATE_NOT_FOUND_ERROR_CODE = 'P2025';
      if (error?.code === RECORD_TO_UPDATE_NOT_FOUND_ERROR_CODE) {
        throw new BadRequestException(API_ERROR_CODES.INVALID_FRIEND_CODE);
      }
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Get('/friends')
  async findFriends(@Req() req: AuthRequest) {
    const user = await this.usersService.findOne({ id: req.user.sub });
    return this.usersService.findMany({
      where: {
        AND: [
          { friends: { some: { id: user.id } } },
          { friendsOf: { some: { id: req.user.sub } } },
        ],
      },
    });
  }

  @UseGuards(AuthGuard)
  @Get('incoming-friend-requests')
  async findIncomingFriendRequests(@Req() req: AuthRequest) {
    const user = await this.usersService.findOne({ id: req.user.sub });
    return this.usersService.findMany({
      where: {
        AND: [
          { friends: { some: { id: user.id } } },
          { friendsOf: { none: { id: req.user.sub } } },
        ],
      },
    });
  }

  @UseGuards(AuthGuard)
  @Get('outgoing-friend-requests')
  async findOutgoingFriendRequests(@Req() req: AuthRequest) {
    const user = await this.usersService.findOne({ id: req.user.sub });
    return this.usersService.findMany({
      where: {
        AND: [
          { friendsOf: { some: { id: user.id } } },
          { friends: { none: { id: req.user.sub } } },
        ],
      },
    });
  }

  @UseGuards(AuthGuard)
  @Get('participations')
  async participations(@Req() req: AuthRequest) {
    return this.matchesService.findMany({
      where: {
        players: {
          some: {
            userId: req.user.sub,
          },
        },
      },
    });
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne({ id });
  }
}
