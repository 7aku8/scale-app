import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { WsAuthGuard } from './guards/ws-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, WsAuthGuard],
  exports: [AuthService, JwtAuthGuard, WsAuthGuard],
})
export class AuthModule {}
