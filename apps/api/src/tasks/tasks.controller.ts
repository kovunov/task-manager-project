import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../shared/validation/zod-validation.pipe';
import {
  CreateTaskDto,
  createTaskSchema,
  UpdateStatusDto,
  updateStatusSchema,
} from './schemas/task.schemas';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createTaskSchema))
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get('my-tasks')
  findMyTasks(@Request() req) {
    return this.tasksService.findUserTasks(req.user.id);
  }

  @Get('unassigned')
  findUnassigned() {
    return this.tasksService.findUnassignedTasks();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findById(id);
  }

  @Put(':id')
  updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateStatusSchema))
    updateTaskDto: UpdateStatusDto,
    @Request() req,
  ) {
    return this.tasksService.updateStatus(id, updateTaskDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(id, req.user.id);
  }

  @Post(':id/assign')
  assignToMe(@Param('id') id: string, @Request() req) {
    return this.tasksService.assignToUser(id, req.user.id);
  }

  @Post(':id/unassign')
  unassign(@Param('id') id: string, @Request() req) {
    return this.tasksService.unassignTask(id, req.user.id);
  }
}
