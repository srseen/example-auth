import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }
    const isPasswordMatching = await bcrypt.compare(pass, user.password);
    if (!isPasswordMatching) {
      return null;
    }
    return user;
  }

  async login(user: User) {
    const tokens = await this.getTokens(user.id, user.email);
    await this.setCurrentRefreshToken(tokens.refreshToken, user.id);
    return tokens;
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.login(user);
  }

  async getNewTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.currentHashedRefreshToken) {
      throw new UnauthorizedException();
    }
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );
    if (!isRefreshTokenMatching) {
      throw new UnauthorizedException();
    }
    const tokens = await this.getTokens(user.id, user.email);
    await this.setCurrentRefreshToken(tokens.refreshToken, user.id);
    return tokens;
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, { currentHashedRefreshToken });
  }

  private async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret:
            this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET') ?? '',
          expiresIn:
            this.configService.get<string>(
              'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
            ) ?? '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret:
            this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET') ?? '',
          expiresIn:
            this.configService.get<string>(
              'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
            ) ?? '7d',
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }
}
