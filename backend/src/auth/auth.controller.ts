import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: Request & { user: User },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(req.user);
    res.cookie('Authentication', tokens.accessToken, {
      httpOnly: true,
    });
    res.cookie('Refresh', tokens.refreshToken, {
      httpOnly: true,
    });
    return tokens;
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(
    @Req() req: Request & { user: { id: string; refreshToken: string } },
  ) {
    const { id, refreshToken } = req.user;
    return this.authService.getNewTokens(id, refreshToken);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: Request & { user: User },
    @Res() res: Response,
  ) {
    const tokens = await this.authService.login(req.user);
    res.cookie('Authentication', tokens.accessToken, { httpOnly: true });
    res.cookie('Refresh', tokens.refreshToken, { httpOnly: true });
    return res.redirect(
      this.configService.get<string>('FRONTEND_URL') ?? '/',
    );
  }
}
