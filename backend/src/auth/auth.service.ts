import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { EmailVerification } from './entities/email-verification.entity';
import { MailService } from './mail.service';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepo: Repository<EmailVerification>,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) {
      return null;
    }
    const isPasswordMatching = await bcrypt.compare(pass, user.password);
    if (!isPasswordMatching) {
      return null;
    }
    if (!user.isEmailVerified) {
      throw new ForbiddenException('Please verify your email');
    }
    return user;
  }

  async login(user: User) {
    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.setCurrentRefreshToken(tokens.refreshToken, user.id);
    return tokens;
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create({
      role: 'user',
      ...createUserDto,
    });
    await this.sendVerification(user);
    return {
      message: 'Registration successful. Please verify your email.',
    };
  }

  private async sendVerification(user: User) {
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await this.emailVerificationRepo.save({
      token: tokenHash,
      expiresAt,
      user,
    });
    await this.mailService.sendVerificationEmail(user.email, token);
  }

  async verifyEmail(email: string, token: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid token');
    }
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const record = await this.emailVerificationRepo.findOne({
      where: { user: { id: user.id }, token: tokenHash, used: false },
    });
    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }
    await this.usersService.update(user.id, { isEmailVerified: true });
    record.used = true;
    await this.emailVerificationRepo.save(record);
  }

  async resendVerification(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.isEmailVerified) {
      return;
    }
    await this.emailVerificationRepo.update(
      { user: { id: user.id }, used: false },
      { used: true },
    );
    await this.sendVerification(user);
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
    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.setCurrentRefreshToken(tokens.refreshToken, user.id);
    return tokens;
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, { currentHashedRefreshToken });
  }

  private async getTokens(userId: string, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
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
        { sub: userId, email, role },
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

  async logout(userId: string) {
    await this.usersService.update(userId, { currentHashedRefreshToken: '' });
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    const { password, currentHashedRefreshToken, ...result } = user;
    return result;
  }
}
