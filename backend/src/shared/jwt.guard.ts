import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.guard';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => (target: any, key?: any, descriptor?: any) => {
  Reflect.defineMetadata(IS_PUBLIC_KEY, true, descriptor ? descriptor.value : target);
};

@Injectable()
export class JwtAuthGuard {
  constructor(private jwt: JwtService, private config: ConfigService, private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const request = context.switchToHttp().getRequest();
    const auth = request.headers['authorization'] as string | undefined;
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException('Missing token');
    const token = auth.slice(7);
    try {
      const payload = this.jwt.verify(token, { secret: this.config.get<string>('JWT_SECRET') });
      request.user = payload;
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
