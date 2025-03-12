import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

// Type guard for NodeJS.ErrnoException
function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

// Make bootstrap a let so we can store its promise
let bootstrapPromise: Promise<void> | null = null;

async function bootstrap() {
  // Only start if not already starting
  if (bootstrapPromise) {
    return bootstrapPromise;
  }

  const logger = new Logger('EntryPoint');
  const PORT = process.env.PORT || 5002;

  // Log environment information for debugging
  console.log('Starting API with environment:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? '[REDACTED]' : 'not set',
    PORT: PORT,
    cwd: process.cwd(),
    nodeVersion: process.version,
  });

  bootstrapPromise = (async () => {
    try {
      console.log('Creating NestJS application with verbose logging');
      const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'], // Enable all log levels
        abortOnError: false, // Prevent silent exits on initialization errors
      });
      console.log('NestJS application created successfully');

      // Configure Swagger
      console.log('Configuring Swagger');
      const config = new DocumentBuilder()
        .setTitle('Task Manager API')
        .setDescription('Task Manager API description')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api', app, document);
      console.log('Swagger configured successfully');

      // Configure app
      console.log('Configuring global pipes and middleware');
      app.useGlobalPipes(new ValidationPipe({ transform: true }));
      app.enableCors();
      app.setGlobalPrefix('api');
      console.log('Middleware configuration complete');

      // Handle graceful shutdown
      console.log('Setting up shutdown handlers');
      process.on('SIGTERM', async () => {
        logger.log('SIGTERM received, shutting down gracefully');
        await app.close();
        process.exit(0);
      });

      process.on('SIGINT', async () => {
        logger.log('SIGINT received, shutting down gracefully');
        await app.close();
        process.exit(0);
      });
      console.log('Shutdown handlers configured');

      // Start listening
      console.log(`Attempting to listen on port ${PORT}`);
      await app.listen(PORT, '0.0.0.0'); // Explicitly listen on all interfaces
      logger.log(`Server running on http://0.0.0.0:${PORT}`);

      // Keep the process alive
      console.log('Server started successfully, keeping alive');
    } catch (error) {
      // Use the type guard to check if the error has a code property
      console.error('Exception during bootstrap:', error);
      if (isErrnoException(error) && error.code === 'EADDRINUSE') {
        logger.error(
          `Port ${PORT} is already in use. Check for other running instances.`,
        );
        process.exit(1);
      } else {
        logger.error('Failed to start application');
        console.error(error); // Log the full error for debugging
        process.exit(1);
      }
    } finally {
      console.log('Bootstrap process completed');
      bootstrapPromise = null;
    }
  })();

  return bootstrapPromise;
}

// Add unhandled exception handlers to prevent silent exits
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit, just log
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit, just log
});

console.log('Starting bootstrap process');
// In Docker containers, we need to make sure the application always starts
// and stays running regardless of how it's invoked
bootstrap().catch((err) => {
  console.error('Failed to bootstrap application:', err);
  // Don't exit immediately for container debugging
  console.error(
    'Application failed to start properly. Keeping process alive for debugging.',
  );
});

// Export for testing/importing purposes
export { bootstrap };
