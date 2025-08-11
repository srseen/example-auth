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
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from './entities/task.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user', 'admin')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: Request & { user: { id: string; role: string } },
  ) {
    return this.tasksService.create(req.user.id, createTaskDto);
  }

  @Get()
  findAll(
    @Req() req: Request & { user: { id: string; role: string } },
    @Query('status') status?: TaskStatus,
    @Query('sortBy') sortBy: 'dueDate' | 'title' = 'dueDate',
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
  ) {
    return this.tasksService.findAllForUser(req.user.id, req.user.role, {
      status,
      sortBy,
      order,
    });
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request & { user: { id: string; role: string } },
  ) {
    const task = await this.tasksService.findOneForUser(id, req.user.id, req.user.role);
    if (!task) {
      throw new NotFoundException();
    }
    return task;
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: Request & { user: { id: string; role: string } },
  ) {
    return this.tasksService.update(id, req.user.id, req.user.role, updateTaskDto);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request & { user: { id: string; role: string } },
  ) {
    return this.tasksService.remove(id, req.user.id, req.user.role);
  }
}
