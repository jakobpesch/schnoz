import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'database';
import { PrismaService } from '../prisma/prisma.service';

const withoutHashSelect = {
  select: {
    id: true,
    email: true,
    name: true,
  },
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
    const user = await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
    if (!user) {
      throw new NotFoundException();
    }
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
}
