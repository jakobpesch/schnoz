import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
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

    return this.authService.generateToken(registeredUser);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne({ id });
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

  @Get(':id/friends')
  async findFriends(@Param('id') id: string) {
    const user = await this.usersService.findOne({ id });
    return this.usersService.findMany({
      where: {
        AND: [
          { friends: { some: { id: user.id } } },
          { friendsOf: { some: { id } } },
        ],
      },
    });
  }

  @Get(':id/incoming-friend-requests')
  async findIncomingFriendRequests(@Param('id') id: string) {
    const user = await this.usersService.findOne({ id });
    return this.usersService.findMany({
      where: {
        AND: [
          { friends: { some: { id: user.id } } },
          { friendsOf: { none: { id } } },
        ],
      },
    });
  }
  @Get(':id/outgoing-friend-requests')
  async findOutgoingFriendRequests(@Param('id') id: string) {
    const user = await this.usersService.findOne({ id });
    return this.usersService.findMany({
      where: {
        AND: [
          { friendsOf: { some: { id: user.id } } },
          { friends: { none: { id } } },
        ],
      },
    });
  }
}
