import { Test, TestingModule } from '@nestjs/testing';
import { SessionAuthController } from './session-auth.controller';

describe('SessionAuthController', () => {
  let controller: SessionAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionAuthController],
    }).compile();

    controller = module.get<SessionAuthController>(SessionAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
