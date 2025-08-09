import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, Profile } from 'passport-google-oauth20';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') ?? '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') ?? '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') ?? '',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<User> {
    const email = profile.emails?.[0]?.value;
    let user = await this.usersService.findByGoogleId(profile.id);
    if (!user && email) {
      user = await this.usersService.findByEmail(email);
    }
    if (!user) {
      const newUser: any = {
        email: email ?? '',
        password: profile.id,
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        profilePictureUrl: profile.photos?.[0]?.value,
        googleId: profile.id,
      };
      user = await this.usersService.create(newUser);
    }
    return user;
  }
}
