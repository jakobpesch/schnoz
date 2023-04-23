import { Test, TestingModule } from '@nestjs/testing';
import { GameSettingsService } from './game-settings.service';

describe('GameSettingsService', () => {
  let service: GameSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameSettingsService],
    }).compile();

    service = module.get<GameSettingsService>(GameSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
