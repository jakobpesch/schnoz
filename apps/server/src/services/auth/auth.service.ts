import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UsersService } from 'src/services/users/users.service';
import { jwtConstants } from './auth.constants';
import { User } from 'database';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUserCreds(email: string, password: string) {
    const user = await this.usersService.findOneWithHash({ email });

    if (!user?.hash) {
      throw new BadRequestException();
    }

    if (!(await bcrypt.compare(password, user.hash))) {
      throw new UnauthorizedException();
    }

    return user;
  }

  generateToken(user: User) {
    return {
      access_token: this.jwtService.sign({
        email: user.email,
        name: user.name,
        sub: user.id,
      }),
    };
  }

  async signIn(email: string, providedPassword: string) {
    const user = await this.validateUserCreds(email, providedPassword);
    return this.generateToken(user);
  }
}
