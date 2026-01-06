import { Injectable, UnauthorizedException } from '@nestjs/common';
import { auth, User } from './auth.instance';

@Injectable()
export class AuthService {
  async validateToken(token: string): Promise<User> {
    try {
      const session = await auth.api.getSession({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (!session || !session.user) {
        throw new UnauthorizedException('Invalid or expired session');
      }

      return session.user as User;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getUserFromToken(token: string): Promise<User | null> {
    try {
      return await this.validateToken(token);
    } catch {
      return null;
    }
  }

  extractTokenFromHeader(authorization: string | undefined): string | null {
    if (!authorization) {
      return null;
    }

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
