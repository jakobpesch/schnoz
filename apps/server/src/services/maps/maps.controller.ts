import { Controller, Get, Param } from '@nestjs/common';
import { MapsService } from './maps.service';
import { Map } from 'database';

@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

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
