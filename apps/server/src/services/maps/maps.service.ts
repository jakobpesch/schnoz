import { Injectable, NotFoundException } from '@nestjs/common';
import { Map, Prisma } from 'database';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MapsService {
  constructor(private prisma: PrismaService) {}

  async findOne(mapWhereUniqueInput: Prisma.MapWhereUniqueInput) {
    const map = await this.prisma.map.findUnique({
      where: mapWhereUniqueInput,
    });

    if (!map) {
      throw new NotFoundException();
    }
    return map;
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.MapWhereUniqueInput;
    where?: Prisma.MapWhereInput;
    orderBy?: Prisma.MapOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.map.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async create(data: Prisma.MapCreateInput) {
    return this.prisma.map.create({
      data,
    });
  }

  async update(params: {
    where: Prisma.MapWhereUniqueInput;
    data: Prisma.MapUncheckedUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.map.update({
      data,
      where,
    });
  }

  async deleteMap(where: Prisma.MapWhereUniqueInput) {
    return this.prisma.map.delete({
      where,
    });
  }
}
