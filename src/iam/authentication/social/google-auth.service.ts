import {
  ConflictException,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuth2Client } from 'google-auth-library';
import googleConfig from 'src/config/google.config';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthenticationService } from '../authentication.service';

@Injectable()
export class GoogleAuthService implements OnModuleInit {
  private oauthClient: OAuth2Client;

  constructor(
    @Inject(googleConfig.KEY)
    private readonly googleConfiguration: ConfigType<typeof googleConfig>,
    private readonly authService: AuthenticationService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  onModuleInit() {
    this.oauthClient = new OAuth2Client(
      this.googleConfiguration.clientID,
      this.googleConfiguration.clientSecret
    );
  }

  async authenticate(token: string) {
    try {
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: token,
      });
      const { email, sub: googleId } = loginTicket.getPayload();
      const user = await this.userRepository.findOneBy({
        googleId,
      });
      if (user) {
        return this.authService.generateTokens(user);
      }

      const newUser = await this.userRepository.save({ email, googleId });
      return this.authService.generateTokens(newUser);
    } catch (err) {
      const pgUniqueValidationErrorCode = '23505';
      if (err?.code === pgUniqueValidationErrorCode) {
        throw new ConflictException();
      }
      throw new UnauthorizedException();
    }
  }
}
