import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from '../auth.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();

    const token =
      client.handshake.auth.token ||
      this.authService.extractTokenFromHeader(client.handshake.headers.authorization as string);

    if (!token) {
      throw new WsException('No token provided');
    }

    try {
      const user = await this.authService.validateToken(token);
      client.data.user = user;
      client.data.userId = user.id;
      client.data.organizationId = (user as any).organizationId;
      return true;
    } catch (error) {
      throw new WsException('Invalid or expired token');
    }
  }
}
