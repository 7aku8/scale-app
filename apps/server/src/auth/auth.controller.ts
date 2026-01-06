import { Controller, Get } from '@nestjs/common';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Session } from '@thallesp/nestjs-better-auth';

@Controller('authentication')
export class AuthController {
  @Get('session')
  getSession(@Session() session: UserSession) {
    return session;
  }
}
