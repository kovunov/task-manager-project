import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcryptjs';
const prisma = new PrismaClient();

async function seed() {
  console.log('Creating users...');
  // Create users if they don't exist
  const adminUser = await prisma.users.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@example.com',
      password_hash: hashSync('admin123', 10),
      first_name: 'Admin',
      last_name: 'User',
    },
  });

  const normalUser = await prisma.users.upsert({
    where: { username: 'user1' },
    update: {},
    create: {
      username: 'user1',
      email: 'user1@example.com',
      password_hash: hashSync('password123', 10),
      first_name: 'Test',
      last_name: 'User',
    },
  });

  console.log('Creating sample tasks...');
  // Create 20 sample tasks
  const priorities = ['high', 'medium', 'low'];
  const statuses = ['pending', 'in_progress', 'completed'];
  const softwareTaskNames = [
    'Fix login authentication bug',
    'Implement RESTful API endpoint',
    'Refactor database queries',
    'Create unit tests for user service',
    'Update npm dependencies',
    'Optimize image loading performance',
    'Add form validation',
    'Configure CI/CD pipeline',
    'Design database schema',
    'Debug memory leak issue',
    'Implement responsive design',
    'Create user documentation',
    'Add error handling middleware',
    'Migrate to TypeScript',
    'Setup Docker environment',
    'Implement caching layer',
    'Code review PR #123',
    'Fix cross-browser compatibility issues',
    'Improve API response times',
    'Update security configurations',
  ];

  for (let i = 1; i <= 20; i++) {
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const dueDate = new Date(
      Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
    );

    const task = await prisma.tasks.create({
      data: {
        title: softwareTaskNames[i % softwareTaskNames.length],
        description: `This is a description for ${
          softwareTaskNames[i % softwareTaskNames.length]
        }`,
        priority,
        status,
        due_date: dueDate,
        created_by: i % 2 === 0 ? adminUser.id : normalUser.id,
      },
    });

    // Assign the task to a user
    await prisma.tasks_users.create({
      data: {
        task_id: task.id,
        user_id: i % 3 === 0 ? adminUser.id : normalUser.id,
        role: i % 5 === 0 ? 'reviewer' : 'assignee',
      },
    });
  }

  console.log('Database seeded with users and 20 sample tasks');
}

seed()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
