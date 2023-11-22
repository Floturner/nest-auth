import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { toFileStream } from 'qrcode';
import { ActiveUser } from '../decorators/active-user.decorator';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { AuthenticationService } from './authentication.service';
import { Auth } from './decorators/auth.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthType } from './enums/auth-type.enum';
import { OtpAuthService } from './otp-auth.service';

@Auth(AuthType.None)
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly otpAuthService: OtpAuthService
  ) {}

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.singUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(
    // @Res({ passthrough: true }) response: Response,
    @Body() signInDto: SignInDto
  ) {
    const tokens = await this.authService.singIn(signInDto);
    // response
    //   .cookie('accessToken', tokens.accessToken, {
    //     secure: true,
    //     httpOnly: true,
    //     sameSite: true,
    //   })
    //   .json(tokens);
    return tokens;
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @Auth(AuthType.Bearer)
  @HttpCode(HttpStatus.OK)
  @Post('2fa/generate')
  async generateQrCode(
    @ActiveUser() activeUser: ActiveUserData,
    @Res() response: Response
  ) {
    const { secret, uri } = await this.otpAuthService.generateSecret(
      activeUser.email
    );
    await this.otpAuthService.enableTfaForUser(activeUser.email, secret);
    response.type('png');
    return toFileStream(response, uri);
  }
}
