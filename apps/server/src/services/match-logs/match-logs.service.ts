import { Injectable, NotFoundException } from '@nestjs/common';
import { MatchLog, Prisma } from 'database';
import { matchRich } from 'src/shared/types/database/match/match-rich.const';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchLogsService {
  constructor(private prisma: PrismaService) {}

  async findMany(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.MatchLogWhereUniqueInput;
    where?: Prisma.MatchLogWhereInput;
    orderBy?: Prisma.MatchLogOrderByWithRelationInput;
  }): Promise<MatchLog[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.matchLog.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async create(data: Prisma.MatchLogUncheckedCreateInput): Promise<MatchLog> {
    return this.prisma.matchLog.create({
      data,
    });
  }
}
