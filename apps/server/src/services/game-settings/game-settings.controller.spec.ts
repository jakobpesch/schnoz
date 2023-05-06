import { Test, TestingModule } from '@nestjs/testing';
import { GameSettingsController } from './game-settings.controller';

describe('GameSettingsController', () => {
  let controller: GameSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameSettingsController],
    }).compile();

    controller = module.get<GameSettingsController>(GameSettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
