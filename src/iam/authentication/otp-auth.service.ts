import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { authenticator } from 'otplib';
import tfaConfig from 'src/config/tfa.config';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OtpAuthService {
  constructor(
    @Inject(tfaConfig.KEY)
    private readonly tfaConfiguration: ConfigType<typeof tfaConfig>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async generateSecret(email: string) {
    const secret = authenticator.generateSecret();
    const uri = authenticator.keyuri(
      email,
      this.tfaConfiguration.appName,
      secret
    );
    return {
      uri,
      secret,
    };
  }

  verifyCode(code: string, secret: string) {
    return authenticator.verify({
      token: code,
      secret,
    });
  }

  async enableTfaForUser(email: string, secret: string) {
    const { id } = await this.userRepository.findOneOrFail({
      where: { email },
      select: { id: true },
    });
    await this.userRepository.update(
      { id },
      {
        tfaSecret: secret,
        isTfaEnabled: true,
      }
    );
  }
}
