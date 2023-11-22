import { Test, TestingModule } from '@nestjs/testing';
import { OtpAuthService } from './otp-auth.service';

describe('OtpAuthService', () => {
  let service: OtpAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OtpAuthService],
    }).compile();

    service = module.get<OtpAuthService>(OtpAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
