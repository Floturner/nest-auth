import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { REQUEST_USER_KEY } from 'src/iam/iam.constants';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { ApiKey } from 'src/users/api-keys/entities/api-key.entity/api-key.entity';
import { Repository } from 'typeorm';
import { ApiKeysService } from '../../api-keys.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly apiKeyService: ApiKeysService,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractKeyFromHeader(request);
    if (!apiKey) throw new UnauthorizedException();
    const apiKeyEntityId = this.apiKeyService.extractIdFromApiKey(apiKey);
    try {
      const apiKeyEntity = await this.apiKeyRepository.findOne({
        where: { uuid: apiKeyEntityId },
        relations: { user: true },
      });
      await this.apiKeyService.validate(apiKey, apiKeyEntity.key);
      request[REQUEST_USER_KEY] = {
        sub: apiKeyEntity.user.id,
        email: apiKeyEntity.user.email,
        role: apiKeyEntity.user.role,
        permissions: apiKeyEntity.user.permissions,
      } as ActiveUserData;
    } catch (err) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractKeyFromHeader(request: Request): string | undefined {
    const [type, key] = request.headers.authorization?.split(' ') ?? [];
    return type === 'ApiKey' ? key : undefined;
  }
}
