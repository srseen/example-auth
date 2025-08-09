declare module '@nestjs/passport' {
  export function PassportStrategy<T = any, U = any>(
    strategy: T,
    name?: U,
  ): { new (...args: any[]): any };
}

declare module '@nestjs/jwt' {
  export class JwtService {
    signAsync(payload: any, options?: any): Promise<string>;
  }
  export class JwtModule {
    static register(options: any): any;
  }
}

declare module 'passport' {
  export interface StrategyOptions {
    [key: string]: unknown;
  }
  export class Strategy {
    constructor(options?: StrategyOptions, verify?: any);
  }
}

declare module 'passport-jwt' {
  export interface StrategyOptions {
    jwtFromRequest: any;
    secretOrKey: string;
    passReqToCallback?: boolean;
  }

  export class Strategy {
    constructor(options: StrategyOptions, verify: any);
  }

  export const ExtractJwt: {
    fromAuthHeaderAsBearerToken(): (req: unknown) => string | null;
    fromBodyField(field: string): (req: unknown) => string | null;
  };
}
