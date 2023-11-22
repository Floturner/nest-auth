import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as session from 'express-session';
import Redis from 'ioredis';
import * as passport from 'passport';
import googleConfig from 'src/config/google.config';
import jwtConfig from 'src/config/jwt.config';
import redisConfig from 'src/config/redis.config';
import sessionConfig from 'src/config/session.config';
import tfaConfig from 'src/config/tfa.config';
import { ApiKey } from 'src/users/api-keys/entities/api-key.entity/api-key.entity';
import { User } from 'src/users/entities/user.entity';
import { ApiKeysService } from './authentication/api-keys.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { AccessTokenGuard } from './authentication/guards/access-token/access-token.guard';
import { ApiKeyGuard } from './authentication/guards/api-key/api-key.guard';
import { AuthenticationGuard } from './authentication/guards/authentication/authentication.guard';
import { OtpAuthService } from './authentication/otp-auth.service';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage/refresh-token-ids.storage';
import { UserSerializer } from './authentication/serializers/user-serializer/user-serializer';
import { SessionAuthController } from './authentication/session-auth.controller';
import { SessionAuthService } from './authentication/session-auth.service';
import { GoogleAuthController } from './authentication/social/google-auth.controller';
import { GoogleAuthService } from './authentication/social/google-auth.service';
import { PermissionsGuard } from './authorization/guards/permissions.guard';
import { PoliciesGuard } from './authorization/guards/policies.guard';
import { RolesGuard } from './authorization/guards/roles/roles.guard';
import { FrameworkContributorPolicyHandler } from './authorization/policies/framework-contributor.policy';
import { PolicyHandlerStorage } from './authorization/policies/policy-handlers.storage';
import { BcryptService } from './hashing/bcrypt.service';
import { HashingService } from './hashing/hashing.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const RedisStore = require('connect-redis').default;

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ApiKey]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(redisConfig),
    ConfigModule.forFeature(googleConfig),
    ConfigModule.forFeature(tfaConfig),
    ConfigModule.forFeature(sessionConfig),
  ],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PoliciesGuard,
    },
    AccessTokenGuard,
    ApiKeyGuard,
    RefreshTokenIdsStorage,
    AuthenticationService,
    PolicyHandlerStorage,
    FrameworkContributorPolicyHandler,
    ApiKeysService,
    GoogleAuthService,
    OtpAuthService,
    SessionAuthService,
    UserSerializer,
  ],
  controllers: [
    AuthenticationController,
    GoogleAuthController,
    SessionAuthController,
  ],
})
export class IamModule implements NestModule {
  constructor(
    @Inject(sessionConfig.KEY)
    private readonly sessionConfiguration: ConfigType<typeof sessionConfig>,
    @Inject(redisConfig.KEY)
    private readonly redisConfiguration: ConfigType<typeof redisConfig>
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          store: new RedisStore({
            client: new Redis(
              this.redisConfiguration.port,
              this.redisConfiguration.host
            ),
          }),
          secret: this.sessionConfiguration.secret,
          resave: false,
          saveUninitialized: false,
          cookie: {
            sameSite: true,
            httpOnly: true,
          },
        }),
        passport.initialize(),
        passport.session()
      )
      .forRoutes('*');
  }
}
