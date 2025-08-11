import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class FacebookStrategy extends PassportStrategy(
  OAuth2Strategy,
  'facebook',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      authorizationURL: 'https://www.facebook.com/v17.0/dialog/oauth',
      tokenURL: 'https://graph.facebook.com/v17.0/oauth/access_token',
      clientID: configService.get<string>('FACEBOOK_APP_ID') ?? '',
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET') ?? '',
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL') ?? '',
      scope: ['email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    // profile is unused because we fetch details manually
    profile: Record<string, unknown>,
  ): Promise<User> {
    interface FacebookProfile {
      id: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      picture?: { data?: { url?: string } };
    }
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,email,first_name,last_name,picture&access_token=${accessToken}`,
    );
    if (!response.ok) {
      throw new Error('Failed to fetch Facebook profile');
    }
    const fbProfile: FacebookProfile = await response.json();
    const email = fbProfile.email;
    const picture = fbProfile.picture?.data?.url;
    let user = await this.usersService.findByFacebookId(fbProfile.id);
    if (!user && email) {
      user = await this.usersService.findByEmail(email);
    }
    if (!user) {
      const newUser: Partial<User> = {
        email: email ?? '',
        firstName: fbProfile.first_name,
        lastName: fbProfile.last_name,
        profilePictureUrl: picture,
        facebookId: fbProfile.id,
        isEmailVerified: true,
      };
      user = await this.usersService.create(newUser);
    } else {
      const updateData: Partial<User> = {};
      if (!user.facebookId) updateData.facebookId = fbProfile.id;
      if (!user.profilePictureUrl && picture) {
        updateData.profilePictureUrl = picture;
      }
      if (!user.isEmailVerified) updateData.isEmailVerified = true;
      if (Object.keys(updateData).length > 0) {
        await this.usersService.update(user.id, updateData);
        user = { ...user, ...updateData } as User;
      }
    }
    return user;
  }
}
