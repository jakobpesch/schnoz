import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common"
import { Match, Rule } from "database"
import { API_ERROR_CODES } from "types"
import { AuthRequest } from "../auth/auth-request.type"
import { AuthGuard } from "../auth/auth.guard"
import { AppLoggerService } from "../logger/logger.service"
import { MatchesService } from "./matches.service"

@Controller("matches")
export class MatchesController {
  private logger = new AppLoggerService(MatchesController.name)
  constructor(private matchesService: MatchesService) {}

  @UseGuards(AuthGuard)
  @Get()
  // TODO: implement pagination
  async findAll(): Promise<Match[]> {
    return this.matchesService.findMany({})
  }

  @UseGuards(AuthGuard)
  @Get("/list")
  // TODO: implement pagination
  async getMatchesList(
    @Req() req: AuthRequest,
    @Query("sort") sort: "asc" | "desc",
  ): Promise<Match[]> {
    return this.matchesService.findMany({
      where: {
        OR: [
          { players: { some: { userId: req.user.sub } } },
          { status: "CREATED" },
        ],
      },
      include: {
        players: {
          include: { user: true },
        },
      },
      orderBy: {
        createdAt: sort,
      },
    })
  }
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.matchesService.findOne({ id })
  }

  @UseGuards(AuthGuard)
  @Put(":id/join")
  async joinMatch(
    @Req() req: AuthRequest,
    @Param("id") id: string,
  ): Promise<Match> {
    const userId = req.user.sub
    const match = await this.matchesService.findOneRich({ id })
    if (match.players.some((participant) => participant.userId === userId)) {
      throw new BadRequestException(API_ERROR_CODES.CANNOT_JOIN_TWICE)
    }
    if (match.players.length === 2) {
      throw new BadRequestException(API_ERROR_CODES.MATCH_FULL)
    }
    return await this.matchesService.update({
      where: { id },
      data: {
        players: { create: { userId: userId, playerNumber: 1 } },
        updatedAt: new Date(),
        logs: {
          create: {
            message: `Player ${userId} joined the match`,
          },
        },
      },
    })
  }

  @UseGuards(AuthGuard)
  @Post()
  async createMatch(@Req() req: AuthRequest): Promise<Match> {
    const userId = req.user.sub
    return this.matchesService.create({
      createdById: userId,
      maxPlayers: 2,
      gameSettings: { create: { mapSize: 11, rules: Object.values(Rule) } },
      players: {
        create: {
          userId: userId,
          playerNumber: 0,
        },
      },
      logs: {
        create: {
          message: `Match created by ${userId}`,
        },
      },
    })
  }

  @UseGuards(AuthGuard)
  @Delete()
  async deleteMatch(
    @Req() req: AuthRequest,
    @Body("id") id: string,
  ): Promise<Match> {
    const userId = req.user.sub
    const match = await this.matchesService.findOne({ id })
    if (match.createdById !== userId) {
      this.logger.warn(
        `User ${userId} tried to delete match ${id} created by ${match.createdById}`,
      )
      throw new ForbiddenException()
    }
    return this.matchesService.delete({ id })
  }
}
