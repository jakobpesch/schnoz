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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'database';
import { AuthService } from '../auth/auth.service';

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
}
