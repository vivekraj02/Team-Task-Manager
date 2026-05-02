import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const createProjectSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional()
});

export const createTaskSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  projectId: z.string().min(1)
});
