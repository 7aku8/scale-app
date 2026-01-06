import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  extractTokenFromHeader(authorization: string | undefined): string | null {
    if (!authorization) {
      return null;
    }

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
