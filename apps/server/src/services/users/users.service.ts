import { faker } from '@faker-js/faker';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { Prisma, User } from 'database';
import { API_ERROR_CODES, UserWithoutHash } from 'types';
import { PrismaService } from '../prisma/prisma.service';

const withoutHashSelect = {
  select: {
    id: true,
    email: true,
    friendCode: true,
    verifiedEmail: true,
    verificationToken: true,
    name: true,
  },
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createGuestUser() {
    const name = this.generateRandomName();

    const user = await this.prisma.user.create({
      data: { name },
    });

    return user;
  }

  private generateRandomFriendCode() {
    const codeLength = 4;
    return faker.random.alphaNumeric(codeLength).toUpperCase();
  }

  async register(params: {
    guestUserId: User['id'];
    email: string;
    name: string;
    password: string;
  }): Promise<UserWithoutHash> {
    const { guestUserId, email, password, name } = params;

    const isValidEmail = (email: string) => {
      const re = /\S+@\S+\.\S+/;
      return re.test(email);
    };

    if (!isValidEmail(email)) {
      throw new BadRequestException('Invalid email');
    }

    let friendCode = this.generateRandomFriendCode();
    // verify friend code is unique
    let user = await this.prisma.user.findUnique({
      where: { friendCode },
    });
    let iteration = 0;
    while (user !== null && iteration < 10) {
      iteration++;
      friendCode = this.generateRandomFriendCode();
      user = await this.prisma.user.findUnique({
        where: { friendCode },
      });
      if (user === null) {
        // found a unique friend code
        break;
      }
    }

    try {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(password, salt);
      const updatedUser = await this.prisma.user.update({
        where: { id: guestUserId },
        data: {
          email,
          hash,
          name,
          friendCode,
        },
        ...withoutHashSelect,
      });
      return updatedUser;
    } catch (error: any) {
      const RECORD_TO_UPDATE_NOT_FOUND_ERROR_CODE = 'P2025';
      if (error.code === RECORD_TO_UPDATE_NOT_FOUND_ERROR_CODE) {
        throw new BadRequestException();
      }
      throw new InternalServerErrorException();
    }
  }

  async addFriend(params: {
    requestingUserId: User['id'];
    friendCode: User['friendCode'];
  }) {
    console.log('addFriend', params);

    // const requestingUser = await this.findOne({ id: params.requestingUserId });
    // const requestedUser = await this.findOne({ id: params.requestedUserId });
    if (!params.friendCode) {
      throw new BadRequestException();
    }

    const requestedFriend = await this.prisma.user.findUnique({
      where: { friendCode: params.friendCode },
    });

    if (requestedFriend?.id === params.requestingUserId) {
      throw new BadRequestException(API_ERROR_CODES.CANNOT_ADD_SELF_AS_FRIEND);
    }

    const requestingUser = await this.prisma.user.findUnique({
      where: { id: params.requestingUserId },
      select: {
        friends: true,
      },
    });

    const requestedAlready = requestingUser?.friends?.some(
      (friend) => friend.id === requestedFriend?.id,
    );

    if (requestedAlready) {
      throw new BadRequestException(API_ERROR_CODES.CANNOT_REQUEST_TWICE);
    }

    return await this.update({
      where: { id: params.requestingUserId },
      data: {
        friends: {
          connect: {
            friendCode: params.friendCode,
          },
        },
      },
    });
  }

  async findOne(userWhereUniqueInput: Prisma.UserWhereUniqueInput) {
    const user = await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      ...withoutHashSelect,
    });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  async findOneWithHash(userWhereUniqueInput: Prisma.UserWhereUniqueInput) {
    console.log('findOneWithHash', userWhereUniqueInput);
    const user = await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
    if (!user) {
      console.log('findOneWithHash user not found');
      throw new NotFoundException();
    }
    console.log('findOneWithHash user found', user);
    return user;
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      ...withoutHashSelect,
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
      ...withoutHashSelect,
    });
  }

  async update(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUncheckedUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
      ...withoutHashSelect,
    });
  }

  async delete(where: Prisma.UserWhereUniqueInput) {
    return this.prisma.user.delete({
      where,
      ...withoutHashSelect,
    });
  }

  private generateRandomName() {
    const capitalize = (string: string) =>
      string.charAt(0).toUpperCase() + string.slice(1);

    const adjective = capitalize(
      faker.word.adjective({ length: { min: 3, max: 6 } }),
    );
    const noun = capitalize(faker.word.noun({ length: { min: 3, max: 6 } }));

    return adjective + ' ' + noun;
  }
}
