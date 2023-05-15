import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, AuthService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
