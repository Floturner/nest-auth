import { Test, TestingModule } from '@nestjs/testing';
import { SessionAuthService } from './session-auth.service';

describe('SessionAuthService', () => {
  let service: SessionAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionAuthService],
    }).compile();

    service = module.get<SessionAuthService>(SessionAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
