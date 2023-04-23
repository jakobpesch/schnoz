import { Test, TestingModule } from '@nestjs/testing';
import { MatchLogsService } from './match-logs.service';

describe('MatchLogsService', () => {
  let service: MatchLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchLogsService],
    }).compile();

    service = module.get<MatchLogsService>(MatchLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
