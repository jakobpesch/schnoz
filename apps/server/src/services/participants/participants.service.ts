import { Injectable, NotFoundException } from '@nestjs/common';
import { Participant, Prisma } from 'database';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParticipantsService {
  constructor(private prisma: PrismaService) {}

  async findOne(
    participantWhereUniqueInput: Prisma.ParticipantWhereUniqueInput,
  ) {
    const participant = await this.prisma.participant.findUnique({
      where: participantWhereUniqueInput,
      include: { user: true },
    });
    if (!participant) {
      throw new NotFoundException();
    }
    return participant;
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ParticipantWhereUniqueInput;
    where?: Prisma.ParticipantWhereInput;
    orderBy?: Prisma.ParticipantOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.participant.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: { user: true },
    });
  }

  async create(data: Prisma.ParticipantCreateInput) {
    return await this.prisma.participant.create({
      data,
      include: { user: true },
    });
  }

  async update(params: {
    where: Prisma.ParticipantWhereUniqueInput;
    data: Prisma.ParticipantUncheckedUpdateInput;
  }) {
    const { where, data } = params;
    return this.prisma.participant.update({
      data,
      where,
      include: { user: true },
    });
  }

  async delete(where: Prisma.ParticipantWhereUniqueInput) {
    return this.prisma.participant.delete({
      where,
    });
  }
}
