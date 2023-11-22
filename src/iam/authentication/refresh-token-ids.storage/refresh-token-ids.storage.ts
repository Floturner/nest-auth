import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Redis } from 'ioredis';
import redisConfig from 'src/config/redis.config';

@Injectable()
export class RefreshTokenIdsStorage
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private redisClient: Redis;

  constructor(
    @Inject(redisConfig.KEY)
    private readonly redisConfiguration: ConfigType<typeof redisConfig>
  ) {}

  onApplicationBootstrap() {
    this.redisClient = new Redis({
      host: this.redisConfiguration.host,
      port: this.redisConfiguration.port,
    });
  }

  onApplicationShutdown() {
    this.redisClient.quit();
  }

  async insert(userId: number, tokenId: string): Promise<void> {
    await this.redisClient.set(this.getKey(userId), tokenId);
  }

  async validate(userId: number, tokenId: string): Promise<boolean> {
    const storedId = await this.redisClient.get(this.getKey(userId));
    if (storedId !== tokenId) {
      throw new InvalidatedRefreshTokenError();
    }
    return storedId === tokenId;
  }

  async invalidate(userId: number): Promise<void> {
    await this.redisClient.del(this.getKey(userId));
  }

  private getKey(userId: number): string {
    return `user-${userId}`;
  }
}

export class InvalidatedRefreshTokenError extends Error {}
