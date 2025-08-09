declare module '@nestjs/jwt' {
  import { DynamicModule } from '@nestjs/common';

  export interface JwtModuleOptions {
    secret?: string;
    signOptions?: {
      expiresIn?: string | number;
    };
  }

  export interface JwtModuleAsyncOptions {
    imports?: any[];
    inject?: any[];
    useFactory?: (
      ...args: any[]
    ) => JwtModuleOptions | Promise<JwtModuleOptions>;
  }

  export class JwtModule {
    static register(options: JwtModuleOptions): DynamicModule;
    static registerAsync(options: JwtModuleAsyncOptions): DynamicModule;
  }

  export class JwtService {
    signAsync(payload: any, options?: any): Promise<string>;
  }
}
