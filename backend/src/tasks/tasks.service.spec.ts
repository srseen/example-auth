import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { Task, TaskStatus } from './entities/task.entity';
import type { User } from '../users/entities/user.entity';
import { BadRequestException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;
  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('update', () => {
    it('throws on invalid status transition', async () => {
      repository.findOne.mockResolvedValue({
        id: '1',
        user: { id: 'u1' },
        status: TaskStatus.TODO,
      });
      await expect(
        service.update('1', 'u1', 'user', { status: TaskStatus.DONE }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('allows valid status transition', async () => {
      const task: Task = {
        id: '1',
        title: 't',
        dueDate: new Date(),
        user: { id: 'u1' } as unknown as User,
        status: TaskStatus.TODO,
      };
      repository.findOne.mockResolvedValue(task);
      repository.save.mockImplementation(async (t) => t);
      await service.update('1', 'u1', 'user', {
        status: TaskStatus.IN_PROGRESS,
      });
      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    });
  });

  describe('findAllForUser', () => {
    it('filters tasks for regular users', async () => {
      repository.find.mockResolvedValue([]);
      await service.findAllForUser('u1', 'user');
      expect(repository.find).toHaveBeenCalledWith({
        where: { user: { id: 'u1' } },
        order: { dueDate: 'ASC' },
      });
    });

    it('allows admin to view all tasks', async () => {
      repository.find.mockResolvedValue([]);
      await service.findAllForUser('ignored', 'admin');
      expect(repository.find).toHaveBeenCalledWith({
        where: {},
        order: { dueDate: 'ASC' },
      });
    });
  });
});
