import { z } from 'zod';

const TaskStatusSchema = z.union([
  z.literal('pending'),
  z.literal('in_progress'),
  z.literal('completed'),
]);

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

const TaskPrioritySchema = z.union([
  z.literal('low'),
  z.literal('medium'),
  z.literal('high'),
]);

export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const createTaskSchema = z.object({
  title: z.string().min(1, { message: 'Title cannot be empty' }),
  description: z.string().optional(),
  status: TaskStatusSchema.optional().default('pending'),
  assigneeId: z.string().optional(),
  priority: TaskPrioritySchema.optional().default('medium'),
  userId: z.string().optional(),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;

export const updateStatusSchema = z.object({
  status: TaskStatusSchema.optional().default('pending'),
});

export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;
