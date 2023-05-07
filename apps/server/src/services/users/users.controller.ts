import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'database';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @HttpCode(HttpStatus.OK)
  @Put('/:id/register')
  async register(
    @Param('id') id: User['id'],
    @Body()
    body: {
      email: string;
      password: string;
      name: string;
    },
  ) {
    const { email, password, name } = body;

    if (name.length < 3) {
      throw new BadRequestException('Name must be at least 3 characters');
    }

    const registeredUser = await this.usersService.register({
      guestUserId: id,
      email,
      name,
      password,
    });

    return registeredUser;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne({ id });
  }
}
