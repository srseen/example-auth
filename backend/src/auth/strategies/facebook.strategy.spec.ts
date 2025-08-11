import { ConfigService } from '@nestjs/config';
import { FacebookStrategy } from './facebook.strategy';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';

describe('FacebookStrategy', () => {
  const usersService = {
    findByFacebookId: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  } as unknown as UsersService;

  const configService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'FACEBOOK_APP_ID') return 'id';
      if (key === 'FACEBOOK_APP_SECRET') return 'secret';
      if (key === 'FACEBOOK_CALLBACK_URL') return 'http://localhost/callback';
      return '';
    }),
  } as unknown as ConfigService;

  let strategy: FacebookStrategy;

  beforeEach(() => {
    jest.clearAllMocks();
    strategy = new FacebookStrategy(configService, usersService);
    const g = global as typeof globalThis & { fetch: jest.Mock };
    g.fetch = jest.fn();
  });

  it('creates a new user when none exists', async () => {
    (usersService.findByFacebookId as jest.Mock).mockResolvedValue(null);
    (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
    (usersService.create as jest.Mock).mockImplementation(
      async (data: Partial<User>) => ({ id: '1', ...data }),
    );
    const g = global as typeof globalThis & { fetch: jest.Mock };
    g.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'fb123',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        picture: { data: { url: 'pic' } },
      }),
    });

    const user = await strategy.validate(
      'token',
      '',
      {} as Record<string, unknown>,
    );
    expect(user.facebookId).toBe('fb123');
    expect(usersService.create).toHaveBeenCalled();
  });

  it('links existing user by email', async () => {
    (usersService.findByFacebookId as jest.Mock).mockResolvedValue(null);
    const existing: Partial<User> = {
      id: '1',
      email: 'test@example.com',
      facebookId: null,
      profilePictureUrl: null,
      isEmailVerified: false,
    };
    (usersService.findByEmail as jest.Mock).mockResolvedValue(existing);
    const g = global as typeof globalThis & { fetch: jest.Mock };
    g.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'fb123',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        picture: { data: { url: 'pic' } },
      }),
    });

    const user = await strategy.validate(
      'token',
      '',
      {} as Record<string, unknown>,
    );
    expect(usersService.update).toHaveBeenCalledWith('1', {
      facebookId: 'fb123',
      profilePictureUrl: 'pic',
      isEmailVerified: true,
    });
    expect(user.facebookId).toBe('fb123');
  });
});
