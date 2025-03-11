import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTaskDto, UpdateStatusDto } from './schemas/task.schemas';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findUserTasks: jest.fn(),
    findUnassignedTasks: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
    assignToUser: jest.fn(),
    unassignTask: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'This is a test task',
        status: 'pending',
      };

      const createdTask = {
        id: 1,
        ...createTaskDto,
      };

      mockTasksService.create.mockResolvedValue(createdTask);

      const result = await controller.create(createTaskDto);

      expect(result).toBe(createdTask);
      expect(service.create).toHaveBeenCalledWith(createTaskDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const tasks = [
        { id: 1, title: 'Task 1' },
        { id: 2, title: 'Task 2' },
      ];

      mockTasksService.findAll.mockResolvedValue(tasks);

      const result = await controller.findAll();

      expect(result).toBe(tasks);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findMyTasks', () => {
    it('should return tasks for the logged-in user', async () => {
      const req = { user: { id: '1' } };
      const userTasks = [{ id: 1, title: 'Task 1' }];

      mockTasksService.findUserTasks.mockResolvedValue(userTasks);

      const result = await controller.findMyTasks(req);

      expect(result).toBe(userTasks);
      expect(service.findUserTasks).toHaveBeenCalledWith('1');
    });
  });

  describe('findUnassigned', () => {
    it('should return unassigned tasks', async () => {
      const unassignedTasks = [{ id: 3, title: 'Task 3' }];

      mockTasksService.findUnassignedTasks.mockResolvedValue(unassignedTasks);

      const result = await controller.findUnassigned();

      expect(result).toBe(unassignedTasks);
      expect(service.findUnassignedTasks).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      const task = { id: 1, title: 'Task 1' };

      mockTasksService.findById.mockResolvedValue(task);

      const result = await controller.findOne('1');

      expect(result).toBe(task);
      expect(service.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('updateStatus', () => {
    it('should update task status', async () => {
      const req = { user: { id: '1' } };
      const updateStatusDto: UpdateStatusDto = { status: 'completed' };
      const updatedTask = {
        id: 1,
        title: 'Task 1',
        status: 'completed',
      };

      mockTasksService.updateStatus.mockResolvedValue(updatedTask);

      const result = await controller.updateStatus('1', updateStatusDto, req);

      expect(result).toBe(updatedTask);
      expect(service.updateStatus).toHaveBeenCalledWith(
        '1',
        updateStatusDto,
        '1',
      );
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      const req = { user: { id: '1' } };
      const deletedTask = { id: 1, title: 'Task 1' };

      mockTasksService.remove.mockResolvedValue(deletedTask);

      const result = await controller.remove('1', req);

      expect(result).toBe(deletedTask);
      expect(service.remove).toHaveBeenCalledWith('1', '1');
    });
  });

  describe('assignToMe', () => {
    it('should assign a task to the current user', async () => {
      const req = { user: { id: '1' } };
      const assignedTask = {
        id: 1,
        title: 'Task 1',
        tasks_users: [{ user_id: 1, role: 'assignee' }],
      };

      mockTasksService.assignToUser.mockResolvedValue(assignedTask);

      const result = await controller.assignToMe('1', req);

      expect(result).toBe(assignedTask);
      expect(service.assignToUser).toHaveBeenCalledWith('1', '1');
    });
  });

  describe('unassign', () => {
    it('should unassign a task from the current user', async () => {
      const req = { user: { id: '1' } };
      const unassignedTask = {
        id: 1,
        title: 'Task 1',
        tasks_users: [],
      };

      mockTasksService.unassignTask.mockResolvedValue(unassignedTask);

      const result = await controller.unassign('1', req);

      expect(result).toBe(unassignedTask);
      expect(service.unassignTask).toHaveBeenCalledWith('1', '1');
    });
  });
});
