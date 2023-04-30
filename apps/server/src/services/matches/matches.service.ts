import { Injectable, NotFoundException } from '@nestjs/common';
import { Match, Prisma } from 'database';
import { matchRich } from 'types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  async findOne(matchWhereUniqueInput: Prisma.MatchWhereUniqueInput) {
    const match = await this.prisma.match.findUnique({
      where: matchWhereUniqueInput,
    });
    if (!match) {
      throw new NotFoundException();
    }
    return match;
  }

  async findOneRich(matchWhereUniqueInput: Prisma.MatchWhereUniqueInput) {
    const match = await this.prisma.match.findUnique({
      where: matchWhereUniqueInput,
      ...matchRich,
    });
    if (!match) {
      throw new NotFoundException();
    }
    return match;
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.MatchWhereUniqueInput;
    where?: Prisma.MatchWhereInput;
    orderBy?: Prisma.MatchOrderByWithRelationInput;
  }): Promise<Match[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.match.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async create(data: Prisma.MatchCreateInput): Promise<Match> {
    return this.prisma.match.create({
      data,
    });
  }

  async update(params: {
    where: Prisma.MatchWhereUniqueInput;
    data: Prisma.MatchUncheckedUpdateInput;
  }): Promise<Match> {
    const { where, data } = params;
    return this.prisma.match.update({
      data,
      where,
    });
  }

  async delete(where: Prisma.MatchWhereUniqueInput): Promise<Match> {
    return this.prisma.match.delete({
      where,
    });
  }
}
