import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/persistence/prisma/prisma.service';

describe('API endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtToken: string;
  let taskId: number;

  beforeAll(async () => {
    // Create test module
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Create application instance
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.setGlobalPrefix('api');
    await app.init();

    // Get prisma service
    prisma = app.get(PrismaService);

    // Clean database before tests
    await prisma.$transaction([
      prisma.tasks_users.deleteMany({}),
      prisma.tasks.deleteMany({}),
      prisma.users.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.$transaction([
      prisma.tasks_users.deleteMany({}),
      prisma.tasks.deleteMany({}),
      prisma.users.deleteMany({}),
    ]);
    await app.close();
  });

  describe('Auth', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email', 'test@example.com');
        });
    });

    it('should not register a user with an existing email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User 2',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Email already in use');
        });
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('email', 'test@example.com');

          // Save token for later tests
          jwtToken = res.body.accessToken;
        });
    });

    it('should not login with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('Tasks', () => {
    it('should require authentication for task endpoints', () => {
      return request(app.getHttpServer()).get('/api/tasks').expect(401);
    });

    it('should create a new task', () => {
      return request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'Test Task',
          description: 'This is a test task',
          status: 'pending',
          priority: 'high',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('title', 'Test Task');
          expect(res.body).toHaveProperty('priority', 'high');

          // Save task ID for later tests
          taskId = res.body.id;
        });
    });

    it('should get all tasks', () => {
      return request(app.getHttpServer())
        .get('/api/tasks')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should get a task by id', () => {
      return request(app.getHttpServer())
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', taskId);
          expect(res.body).toHaveProperty('title', 'Test Task');
        });
    });

    it('should update task status', () => {
      return request(app.getHttpServer())
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          status: 'in_progress',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'in_progress');
        });
    });

    it('should assign a task to the current user', () => {
      return request(app.getHttpServer())
        .post(`/api/tasks/${taskId}/assign`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', taskId);
          expect(res.body).toHaveProperty('tasks_users');
          expect(res.body.tasks_users.length).toBeGreaterThan(0);
        });
    });

    it('should get tasks assigned to the current user', () => {
      return request(app.getHttpServer())
        .get('/api/tasks/my-tasks')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should unassign a task from the current user', () => {
      return request(app.getHttpServer())
        .post(`/api/tasks/${taskId}/unassign`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(201);
    });

    it('should get unassigned tasks', () => {
      return request(app.getHttpServer())
        .get('/api/tasks/unassigned')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should delete a task', () => {
      return request(app.getHttpServer())
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
    });
  });
});
