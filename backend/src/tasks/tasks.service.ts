import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  create(userId: string, createTaskDto: CreateTaskDto) {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      dueDate: new Date(createTaskDto.dueDate),
      user: { id: userId } as User,
    });
    return this.tasksRepository.save(task);
  }

  findAllForUser(
    userId: string,
    role: string,
    options: {
      status?: Task['status'];
      sortBy?: keyof Task;
      order?: 'ASC' | 'DESC';
    } = {},
  ) {
    const { status, sortBy = 'dueDate', order = 'ASC' } = options;
    const where = role === 'admin' ? {} : { user: { id: userId } };
    return this.tasksRepository.find({
      where: { ...where, ...(status ? { status } : {}) },
      order: sortBy ? { [sortBy]: order } : undefined,
    });
  }

  findOneForUser(id: string, userId: string, role: string) {
    return this.tasksRepository.findOne({
      where: role === 'admin' ? { id } : { id, user: { id: userId } },
    });
  }

  async update(
    id: string,
    userId: string,
    role: string,
    updateTaskDto: UpdateTaskDto,
  ) {
    const task = await this.findOneForUser(id, userId, role);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (updateTaskDto.status && updateTaskDto.status !== task.status) {
      // Enforce a strict Todo -> In Progress -> Done progression so tasks
      // cannot skip directly from Todo to Done or regress in the workflow.
      const order = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];
      const currentIndex = order.indexOf(task.status);
      const newIndex = order.indexOf(updateTaskDto.status);
      if (newIndex !== currentIndex + 1) {
        throw new BadRequestException('Invalid status transition');
      }
    }
    if (updateTaskDto.dueDate) {
      // Convert incoming ISO strings to Date objects for persistence.
      updateTaskDto.dueDate = new Date(updateTaskDto.dueDate);
    }
    Object.assign(task, updateTaskDto);
    return this.tasksRepository.save(task);
  }

  async remove(id: string, userId: string, role: string) {
    const task = await this.findOneForUser(id, userId, role);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    await this.tasksRepository.remove(task);
    return task;
  }
}
