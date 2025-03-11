import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../persistence/prisma/prisma.service';
import { CreateTaskDto, UpdateStatusDto } from './schemas/task.schemas';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    const task = await this.prisma.tasks.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status,
        created_by: createTaskDto.userId
          ? parseInt(createTaskDto.userId)
          : null,
        priority: createTaskDto.priority || 'medium',
      },
    });

    // If there's an assignee, create the task_users relationship
    if (createTaskDto.assigneeId) {
      await this.prisma.tasks_users.create({
        data: {
          task_id: task.id,
          user_id: parseInt(createTaskDto.assigneeId),
          role: 'assignee',
        },
      });
    }

    return this.findById(task.id);
  }

  async findAll() {
    return this.prisma.tasks.findMany({
      include: {
        tasks_users: {
          include: {
            users: {
              select: {
                id: true,
                username: true,
                email: true,
                first_name: true,
                last_name: true,
              },
            },
          },
          where: {
            role: 'assignee',
          },
        },
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });
  }

  async findUserTasks(userId: string) {
    const parsedUserId = parseInt(userId);
    return this.prisma.tasks.findMany({
      where: {
        tasks_users: {
          some: {
            user_id: parsedUserId,
            role: 'assignee',
          },
        },
      },
      include: {
        tasks_users: {
          include: {
            users: {
              select: {
                id: true,
                username: true,
                email: true,
                first_name: true,
                last_name: true,
              },
            },
          },
          where: {
            role: 'assignee',
          },
        },
      },
    });
  }

  async findUnassignedTasks() {
    return this.prisma.tasks.findMany({
      where: {
        tasks_users: {
          none: {
            role: 'assignee',
          },
        },
      },
    });
  }

  async findById(id: string | number) {
    const taskId = typeof id === 'string' ? parseInt(id) : id;

    const task = await this.prisma.tasks.findUnique({
      where: { id: taskId },
      include: {
        tasks_users: {
          include: {
            users: {
              select: {
                id: true,
                username: true,
                email: true,
                first_name: true,
                last_name: true,
              },
            },
          },
          where: {
            role: 'assignee',
          },
        },
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async updateStatus(
    id: string,
    updateTaskDto: UpdateStatusDto,
    userId?: string,
  ) {
    const taskId = parseInt(id);
    const task = await this.findById(taskId);

    // Check if user is authorized to update the task
    if (userId) {
      const parsedUserId = parseInt(userId);
      const isAssigned = task.tasks_users.some(
        (tu) => tu.user_id === parsedUserId && tu.role === 'assignee',
      );
      const isCreator = task.created_by === parsedUserId;

      if (!isAssigned && !isCreator) {
        throw new ForbiddenException(
          'You can only edit tasks assigned to you or created by you',
        );
      }
    }

    // Remove logging and safely use the status value
    await this.prisma.tasks.update({
      where: { id: taskId },
      data: {
        status: updateTaskDto.status,
        updated_at: new Date(),
      },
    });

    return this.findById(taskId);
  }

  async remove(id: string, userId?: string) {
    const taskId = parseInt(id);
    const task = await this.findById(taskId);

    // Check if user is authorized to delete the task
    if (userId) {
      const parsedUserId = parseInt(userId);
      const isAssigned = task.tasks_users.some(
        (tu) => tu.user_id === parsedUserId && tu.role === 'assignee',
      );
      const isCreator = task.created_by === parsedUserId;

      if (!isAssigned && !isCreator) {
        throw new ForbiddenException(
          'You can only delete tasks assigned to you or created by you',
        );
      }
    }

    return this.prisma.tasks.delete({
      where: { id: taskId },
    });
  }

  async assignToUser(id: string, userId: string) {
    const taskId = parseInt(id);
    const parsedUserId = parseInt(userId);

    // Check if the assignment already exists
    const existingAssignment = await this.prisma.tasks_users.findFirst({
      where: {
        task_id: taskId,
        user_id: parsedUserId,
        role: 'assignee',
      },
    });

    if (!existingAssignment) {
      await this.prisma.tasks_users.create({
        data: {
          task_id: taskId,
          user_id: parsedUserId,
          role: 'assignee',
        },
      });
    }

    return this.findById(taskId);
  }

  async unassignTask(id: string, userId: string) {
    const taskId = parseInt(id);
    const parsedUserId = parseInt(userId);

    // Check if the assignment exists
    const existingAssignment = await this.prisma.tasks_users.findFirst({
      where: {
        task_id: taskId,
        user_id: parsedUserId,
        role: 'assignee',
      },
    });

    if (!existingAssignment) {
      throw new NotFoundException(
        `User with ID ${userId} is not assigned to task with ID ${id}`,
      );
    }

    // Delete the assignment
    await this.prisma.tasks_users.delete({
      where: {
        id: existingAssignment.id,
      },
    });

    return this.findById(taskId);
  }
}
