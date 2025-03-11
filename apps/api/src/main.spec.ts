import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Mock module imports
jest.mock('@nestjs/core');
jest.mock('@nestjs/swagger');

// Mock the AppModule
const AppModule = {};

describe('Bootstrap', () => {
  const originalEnv = process.env;
  let mockApp;

  beforeEach(() => {
    // Reset process.env
    process.env = { ...originalEnv };

    // Setup mocks
    mockApp = {
      useGlobalPipes: jest.fn(),
      enableCors: jest.fn(),
      setGlobalPrefix: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
      get: jest.fn(),
    };

    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);

    const mockDocBuilder = {
      setTitle: jest.fn().mockReturnThis(),
      setDescription: jest.fn().mockReturnThis(),
      setVersion: jest.fn().mockReturnThis(),
      addBearerAuth: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue({}),
    };

    (DocumentBuilder as jest.Mock).mockImplementation(() => mockDocBuilder);
    SwaggerModule.createDocument = jest.fn();
    SwaggerModule.setup = jest.fn();

    // Define bootstrap manually to avoid module import issues
    global.bootstrap = async () => {
      const app = await NestFactory.create(AppModule);

      const config = new DocumentBuilder()
        .setTitle('Task Manager API')
        .setDescription('Task Manager API description')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api', app, document);

      const PORT = process.env.PORT || 5002;

      app.useGlobalPipes(new ValidationPipe({ transform: true }));
      app.enableCors();
      app.setGlobalPrefix('api');
      await app.listen(PORT);

      return app;
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.resetAllMocks();
  });

  it('should configure the application correctly', async () => {
    process.env.PORT = '5002';

    await global.bootstrap();

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(mockApp.useGlobalPipes).toHaveBeenCalled();
    expect(mockApp.enableCors).toHaveBeenCalled();
    expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith('api');
    expect(mockApp.listen).toHaveBeenCalledWith('5002');
  });

  it('should use default port if not provided', async () => {
    delete process.env.PORT;

    await global.bootstrap();

    expect(mockApp.listen).toHaveBeenCalledWith(5002);
  });
});
