import { Test, TestingModule } from '@nestjs/testing';
import { TilesController } from './tiles.controller';

describe('TilesController', () => {
  let controller: TilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TilesController],
    }).compile();

    controller = module.get<TilesController>(TilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
