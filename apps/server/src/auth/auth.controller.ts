import { All, Controller, Get, Req, Res } from '@nestjs/common';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Session } from '@thallesp/nestjs-better-auth';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.instance';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  @All('*path')
  async handleRequest(@Req() req: Request, @Res() res: Response) {
    return toNodeHandler(auth())(req, res);
  }

  @Get('session')
  getSession(@Session() session: UserSession) {
    return session;
  }
}
