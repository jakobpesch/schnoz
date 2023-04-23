import { Test, TestingModule } from '@nestjs/testing';
import { TilesService } from './tiles.service';

describe('TilesService', () => {
  let service: TilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TilesService],
    }).compile();

    service = module.get<TilesService>(TilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
