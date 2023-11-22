import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import jwtConfig from 'src/config/jwt.config';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from '../hashing/hashing.service';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RefreshTokenData } from '../interfaces/refresh-token-data.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { OtpAuthService } from './otp-auth.service';
import {
  InvalidatedRefreshTokenError,
  RefreshTokenIdsStorage,
} from './refresh-token-ids.storage/refresh-token-ids.storage';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
    private readonly otpAuthService: OtpAuthService
  ) {}

  async singUp(signUpDto: SignUpDto) {
    try {
      const user = new User();
      user.email = signUpDto.email;
      user.password = await this.hashingService.hash(signUpDto.password);

      return await this.usersRepository.save(user);
    } catch (err) {
      const pgUniqueValidationErrorCode = '23505';
      if (err.code === pgUniqueValidationErrorCode) {
        throw new ConflictException(
          `The email address [${signUpDto.email}] already exists`
        );
      }
      throw err;
    }
  }

  async singIn(signInDto: SignInDto) {
    const user = await this.usersRepository.findOneBy({
      email: signInDto.email,
    });
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }
    const matchPassword = await this.hashingService.compare(
      signInDto.password,
      user.password
    );
    if (!matchPassword) {
      throw new UnauthorizedException('Password does not match');
    }
    if (user.isTfaEnabled) {
      const isValidCode = this.otpAuthService.verifyCode(
        signInDto.tfaCode,
        user.tfaSecret
      );
      if (!isValidCode) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }
    return await this.generateTokens(user);
  }

  async generateTokens(user: User) {
    const refreshTokenId = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        { email: user.email, role: user.role, permissions: user.permissions }
      ),
      this.signToken<RefreshTokenData>(
        user.id,
        this.jwtConfiguration.refreshTokenTtl,
        { refreshTokenId }
      ),
    ]);
    await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId);
    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'> & RefreshTokenData
      >(refreshTokenDto.refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      const user = await this.usersRepository.findOneByOrFail({
        id: sub,
      });

      const isValidRefreshToken = await this.refreshTokenIdsStorage.validate(
        user.id,
        refreshTokenId
      );
      if (isValidRefreshToken) {
        await this.refreshTokenIdsStorage.invalidate(user.id);
      } else {
        throw new Error('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (err) {
      if (err instanceof InvalidatedRefreshTokenError) {
        throw new UnauthorizedException('Access denied');
      }
      throw new UnauthorizedException(err?.message ?? 'Invalid credentials');
    }
  }

  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      }
    );
  }
}
