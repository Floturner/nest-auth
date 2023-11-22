import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { promisify } from 'util';
import { ActiveUser } from '../decorators/active-user.decorator';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { Auth } from './decorators/auth.decorator';
import { SignInDto } from './dto/sign-in.dto';
import { AuthType } from './enums/auth-type.enum';
import { SessionGuard } from './guards/session/session.guard';
import { SessionAuthService } from './session-auth.service';

@Auth(AuthType.None)
@Controller('auth/session')
export class SessionAuthController {
  constructor(private readonly sessionAuthService: SessionAuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@Req() request: Request, @Body() signInDto: SignInDto) {
    const user = await this.sessionAuthService.singIn(signInDto);
    await promisify(request.logIn).call(request, user);
  }

  @UseGuards(SessionGuard)
  @Get()
  async sayHello(@ActiveUser() user: ActiveUserData) {
    return `Hello ${user.email}`;
  }
}
