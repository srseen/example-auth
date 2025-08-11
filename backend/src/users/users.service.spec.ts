import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

const compareMock = jest.fn().mockResolvedValue(true);
const hashMock = jest.fn().mockResolvedValue('hashed');

jest.mock(
  'bcrypt',
  () => ({
    hash: (password: string, salt: number) => hashMock(password, salt),
    compare: (data: string, encrypted: string) => compareMock(data, encrypted),
  }),
  { virtual: true },
);

describe('UsersService', () => {
  let service: UsersService;
  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as const;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('updates password when current password matches', async () => {
    repo.findOne.mockResolvedValue({ id: '1', password: 'oldhash' });
    await service.updatePassword('1', 'old', 'new');
    expect(compareMock).toHaveBeenCalledWith('old', 'oldhash');
    expect(hashMock).toHaveBeenCalledWith('new', 10);
    expect(repo.update).toHaveBeenCalledWith('1', { password: 'hashed' });
  });

  it('throws when current password is invalid', async () => {
    repo.findOne.mockResolvedValue({ id: '1', password: 'oldhash' });
    compareMock.mockResolvedValueOnce(false);
    await expect(
      service.updatePassword('1', 'bad', 'new'),
    ).rejects.toThrow();
  });

  it('removes user', async () => {
    await service.remove('1');
    expect(repo.delete).toHaveBeenCalledWith('1');
  });
});
