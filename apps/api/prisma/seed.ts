import { PrismaClient } from '@prisma/client';
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
      password_hash:
        '$2a$10$XUHmWgwp5F3WAzuoYKLs9.BwoGIJ/VM4.PJ1tkTmKBKHxzGbOjA2C' /* password: admin123 */,
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
      password_hash:
        '$2a$10$gxGU8D.tRqzrPTVslbmL2uJdZNXRSA9VpvUaHgsN.TmXbq2SQvOzi' /* password: password123 */,
      first_name: 'Test',
      last_name: 'User',
    },
  });

  console.log('Creating sample tasks...');
  // Create 20 sample tasks
  const priorities = ['high', 'medium', 'low'];
  const statuses = ['pending', 'in_progress', 'completed'];

  for (let i = 1; i <= 20; i++) {
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const dueDate = new Date(
      Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
    );

    // Create the task
    const task = await prisma.tasks.create({
      data: {
        title: `Sample Task ${i}`,
        description: `This is a description for sample task ${i}`,
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
