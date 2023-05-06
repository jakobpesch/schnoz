import { Test, TestingModule } from '@nestjs/testing';
import { MatchLogsController } from './match-logs.controller';

describe('MatchLogsController', () => {
  let controller: MatchLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchLogsController],
    }).compile();

    controller = module.get<MatchLogsController>(MatchLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
