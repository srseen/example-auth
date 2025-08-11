import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
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

  @Get('verify-email')
  async verifyEmail(
    @Query('token') token: string,
    @Query('email') email: string,
    @Res() res: Response,
  ) {
    await this.authService.verifyEmail(email, token);
    return res.redirect(
      `${this.configService.get<string>('FRONTEND_URL')}/verify/success`,
    );
  }

  @Post('resend-verification')
  async resendVerification(@Body('email') email: string) {
    await this.authService.resendVerification(email);
    return { message: 'Verification email sent' };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: Request & { user: User },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(req.user);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    return { accessToken: tokens.accessToken };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(
    @Req() req: Request & { user: { id: string; refreshToken: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { id, refreshToken } = req.user;
    const tokens = await this.authService.getNewTokens(id, refreshToken);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    return { accessToken: tokens.accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: Request & { user: { id: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user.id);
    res.clearCookie('refreshToken');
    return { message: 'Logged out' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@Req() req: Request & { user: { id: string } }) {
    return this.authService.getProfile(req.user.id);
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
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? '';
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    const { id, email, firstName, lastName, profilePictureUrl, role } =
      req.user;
    const userParam = encodeURIComponent(
      JSON.stringify({
        id,
        email,
        firstName,
        lastName,
        profilePictureUrl,
        role,
      }),
    );
    const params = new URLSearchParams({
      accessToken: tokens.accessToken,
      user: userParam,
    });
    return res.redirect(
      `${frontendUrl}/auth/google/callback?${params.toString()}`,
    );
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthCallback(
    @Req() req: Request & { user: User },
    @Res() res: Response,
  ) {
    const tokens = await this.authService.login(req.user);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? '';
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    const { id, email, firstName, lastName, profilePictureUrl, role } =
      req.user;
    const userParam = encodeURIComponent(
      JSON.stringify({
        id,
        email,
        firstName,
        lastName,
        profilePictureUrl,
        role,
      }),
    );
    const params = new URLSearchParams({
      accessToken: tokens.accessToken,
      user: userParam,
    });
    return res.redirect(
      `${frontendUrl}/auth/facebook/callback?${params.toString()}`,
    );
  }
}
