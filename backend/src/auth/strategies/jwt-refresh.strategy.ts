import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

interface RefreshPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      // ใช้ custom extractor แทน fromExtractors
      jwtFromRequest: (req: Request): string | null =>
        (req?.cookies?.refreshToken as string | undefined) ?? null,
      secretOrKey: configService.get<string>('JWT_REFRESH_TOKEN_SECRET') ?? '',
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: RefreshPayload) {
    const refreshToken = req.cookies?.refreshToken ?? '';
    return { id: payload.sub, email: payload.email, refreshToken };
  }
}
