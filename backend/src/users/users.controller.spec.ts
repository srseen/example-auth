import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import type { Request } from 'express';

jest.mock(
  '@nestjs/passport',
  () => ({
    AuthGuard: () => class {},
  }),
  { virtual: true },
);

describe('UsersController', () => {
  let controller: UsersController;
  let service: {
    findById: jest.Mock;
    update: jest.Mock;
    updatePassword: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: (service = {
            findById: jest.fn(),
            update: jest.fn(),
            updatePassword: jest.fn(),
            remove: jest.fn(),
          }),
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('updates password', async () => {
    await controller.changePassword(
      { user: { id: '1', role: 'user' } } as unknown as Request & {
        user: { id: string; role: string };
      },
      { currentPassword: 'a', newPassword: 'b' },
    );
    expect(service.updatePassword).toHaveBeenCalledWith('1', 'a', 'b');
  });

  it('deletes account', async () => {
    await controller.deleteMe({
      user: { id: '1', role: 'user' },
    } as unknown as Request & {
      user: { id: string; role: string };
    });
    expect(service.remove).toHaveBeenCalledWith('1');
  });
});
