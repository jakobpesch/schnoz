import { Test, TestingModule } from '@nestjs/testing';
import { MapsController } from './maps.controller';

describe('MapsController', () => {
  let controller: MapsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MapsController],
    }).compile();

    controller = module.get<MapsController>(MapsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
