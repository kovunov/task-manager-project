import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../persistence/prisma/prisma.service';
import { CreateTaskDto, UpdateStatusDto } from './schemas/task.schemas';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    tasks: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    tasks_users: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task successfully', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'This is a test task',
        status: 'pending',
        userId: '1',
      };

      const createdTask = {
        id: 1,
        title: 'Test Task',
        description: 'This is a test task',
        status: 'pending',
        created_by: 1,
        priority: 'medium',
      };

      mockPrismaService.tasks.create.mockResolvedValue(createdTask);
      mockPrismaService.tasks.findUnique.mockResolvedValue({
        ...createdTask,
        tasks_users: [],
        users: { id: 1, username: 'testuser', email: 'test@example.com' },
      });

      const result = await service.create(createTaskDto);

      expect(mockPrismaService.tasks.create).toHaveBeenCalledWith({
        data: {
          title: createTaskDto.title,
          description: createTaskDto.description,
          status: createTaskDto.status,
          created_by: 1,
          priority: 'medium',
        },
      });

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('title', 'Test Task');
    });

    it('should create a task with an assignee', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'This is a test task',
        status: 'pending',
        userId: '1',
        assigneeId: '2',
      };

      const createdTask = {
        id: 1,
        title: 'Test Task',
        description: 'This is a test task',
        status: 'pending',
        created_by: 1,
        priority: 'medium',
      };

      mockPrismaService.tasks.create.mockResolvedValue(createdTask);
      mockPrismaService.tasks.findUnique.mockResolvedValue({
        ...createdTask,
        tasks_users: [
          {
            user_id: 2,
            role: 'assignee',
            users: {
              id: 2,
              username: 'assignee',
              email: 'assignee@example.com',
            },
          },
        ],
        users: { id: 1, username: 'testuser', email: 'test@example.com' },
      });

      await service.create(createTaskDto);

      expect(mockPrismaService.tasks_users.create).toHaveBeenCalledWith({
        data: {
          task_id: 1,
          user_id: 2,
          role: 'assignee',
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all tasks', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Task 1',
          tasks_users: [],
          users: { id: 1, username: 'testuser' },
        },
        {
          id: 2,
          title: 'Task 2',
          tasks_users: [],
          users: { id: 1, username: 'testuser' },
        },
      ];

      mockPrismaService.tasks.findMany.mockResolvedValue(mockTasks);

      const result = await service.findAll();

      expect(result).toEqual(mockTasks);
      expect(mockPrismaService.tasks.findMany).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a task by id', async () => {
      const mockTask = {
        id: 1,
        title: 'Task 1',
        tasks_users: [],
        users: { id: 1, username: 'testuser' },
      };

      mockPrismaService.tasks.findUnique.mockResolvedValue(mockTask);

      const result = await service.findById('1');

      expect(result).toEqual(mockTask);
      expect(mockPrismaService.tasks.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if task not found', async () => {
      mockPrismaService.tasks.findUnique.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    const mockTask = {
      id: 1,
      title: 'Task 1',
      status: 'pending',
      created_by: 1,
      tasks_users: [{ user_id: 2, role: 'assignee' }],
      users: { id: 1, username: 'testuser' },
    };

    it('should update task status', async () => {
      const updateDto: UpdateStatusDto = { status: 'completed' };
      const userId = '1'; // Add the userId that matches the task creator

      // First, mock finding the original task
      mockPrismaService.tasks.findUnique.mockResolvedValue(mockTask);

      // Then, mock the update response with the updated status
      const updatedTask = {
        ...mockTask,
        status: 'completed', // Make sure this matches the expected status
      };

      mockPrismaService.tasks.update.mockResolvedValue(updatedTask);

      await service.updateStatus('1', updateDto, userId);

      expect(mockPrismaService.tasks.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object),
      });

      expect(mockPrismaService.tasks.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          status: 'completed',
          updated_at: expect.any(Date),
        },
      });
    });

    it('should throw ForbiddenException if user not authorized', async () => {
      const updateDto: UpdateStatusDto = { status: 'completed' };

      mockPrismaService.tasks.findUnique.mockResolvedValue(mockTask);

      await expect(service.updateStatus('1', updateDto, '3')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('assignToUser', () => {
    it('should assign a task to a user', async () => {
      const taskId = '1';
      const userId = '2';

      mockPrismaService.tasks_users.findFirst.mockResolvedValue(null);
      mockPrismaService.tasks.findUnique.mockResolvedValue({
        id: 1,
        title: 'Task 1',
        tasks_users: [],
      });

      await service.assignToUser(taskId, userId);

      expect(mockPrismaService.tasks_users.create).toHaveBeenCalledWith({
        data: {
          task_id: 1,
          user_id: 2,
          role: 'assignee',
        },
      });
    });

    it('should not create duplicate assignments', async () => {
      const taskId = '1';
      const userId = '2';

      mockPrismaService.tasks_users.findFirst.mockResolvedValue({
        id: 1,
        task_id: 1,
        user_id: 2,
        role: 'assignee',
      });
      mockPrismaService.tasks.findUnique.mockResolvedValue({
        id: 1,
        title: 'Task 1',
        tasks_users: [],
      });

      await service.assignToUser(taskId, userId);

      expect(mockPrismaService.tasks_users.create).not.toHaveBeenCalled();
    });
  });

  describe('unassignTask', () => {
    it('should unassign a task from a user', async () => {
      const taskId = '1';
      const userId = '2';

      const assignment = {
        id: 1,
        task_id: 1,
        user_id: 2,
        role: 'assignee',
      };

      mockPrismaService.tasks_users.findFirst.mockResolvedValue(assignment);
      mockPrismaService.tasks.findUnique.mockResolvedValue({
        id: 1,
        title: 'Task 1',
        tasks_users: [],
      });

      await service.unassignTask(taskId, userId);

      expect(mockPrismaService.tasks_users.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if assignment does not exist', async () => {
      const taskId = '1';
      const userId = '2';

      mockPrismaService.tasks_users.findFirst.mockResolvedValue(null);

      await expect(service.unassignTask(taskId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
