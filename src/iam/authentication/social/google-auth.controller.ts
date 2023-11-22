import { Body, Controller, Post } from '@nestjs/common';
import { Auth } from '../decorators/auth.decorator';
import { GoogleTokenDto } from '../dto/google-token.dto';
import { AuthType } from '../enums/auth-type.enum';
import { GoogleAuthService } from './google-auth.service';

@Auth(AuthType.None)
@Controller('auth/google')
export class GoogleAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Post()
  authenticate(@Body() googleTokenDto: GoogleTokenDto) {
    return this.googleAuthService.authenticate(googleTokenDto.token);
  }
}
