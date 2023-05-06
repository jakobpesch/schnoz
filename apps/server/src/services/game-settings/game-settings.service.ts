import { Injectable } from '@nestjs/common';
import { Prisma } from 'database';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GameSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(
    gamesettingsWhereUniqueInput: Prisma.GameSettingsWhereUniqueInput,
  ) {
    return await this.prisma.gameSettings.findUnique({
      where: gamesettingsWhereUniqueInput,
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.GameSettingsWhereUniqueInput;
    where?: Prisma.GameSettingsWhereInput;
    orderBy?: Prisma.GameSettingsOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.gameSettings.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async create(data: Prisma.GameSettingsCreateInput) {
    return this.prisma.gameSettings.create({
      data,
    });
  }

  async update(params: {
    where: Prisma.GameSettingsWhereUniqueInput;
    data: Prisma.GameSettingsUncheckedUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.gameSettings.update({
      data,
      where,
    });
  }

  async delete(where: Prisma.GameSettingsWhereUniqueInput) {
    return this.prisma.gameSettings.delete({
      where,
    });
  }
}
