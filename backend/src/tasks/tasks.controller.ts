import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.tasksService.create(req.user.id, createTaskDto);
  }

  @Get()
  findAll(@Req() req: Request & { user: { id: string } }) {
    return this.tasksService.findAllForUser(req.user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request & { user: { id: string } },
  ) {
    const task = await this.tasksService.findOneForUser(id, req.user.id);
    if (!task) {
      throw new NotFoundException();
    }
    return task;
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.tasksService.update(id, req.user.id, updateTaskDto);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.tasksService.remove(id, req.user.id);
  }
}
