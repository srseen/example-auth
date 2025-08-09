import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
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
      user: { id: userId } as User,
    });
    return this.tasksRepository.save(task);
  }

  findAllForUser(userId: string) {
    return this.tasksRepository.find({
      where: { user: { id: userId } },
    });
  }

  findOneForUser(id: string, userId: string) {
    return this.tasksRepository.findOne({
      where: { id, user: { id: userId } },
    });
  }

  async update(id: string, userId: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOneForUser(id, userId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    Object.assign(task, updateTaskDto);
    return this.tasksRepository.save(task);
  }

  async remove(id: string, userId: string) {
    const task = await this.findOneForUser(id, userId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    await this.tasksRepository.remove(task);
    return task;
  }
}
