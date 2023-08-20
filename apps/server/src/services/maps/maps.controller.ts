import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Map } from 'database';
import { AuthRequest } from '../auth/auth-request.type';
import { MatchesService } from '../matches/matches.service';
import { MapsService } from './maps.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Req() req: AuthRequest,
    @Body('matchId') matchId: string,
  ): Promise<Map> {
    const userId = req.user.sub;
    return this.mapsService.create({ userId, matchId });
  }

  @Get()
  // TODO: implement pagination
  async findAll(): Promise<Map[]> {
    return this.mapsService.findMany({});
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Map> {
    return this.mapsService.findOne({ id });
  }
}
