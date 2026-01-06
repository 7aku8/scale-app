import { All, Controller, Req, Res, Get, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { auth } from './auth.instance';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { User } from './auth.instance';

@Controller('auth')
export class AuthController {
  @All('*')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    return auth.handler(req as any);
  }

  @Get('session')
  @UseGuards(JwtAuthGuard)
  async getSession(@CurrentUser() user: User) {
    return { user };
  }
}
