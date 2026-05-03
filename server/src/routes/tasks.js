import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { createTaskSchema } from '../utils/validators.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const userId = req.user.id;
  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { assigneeId: userId },
        { project: { members: { some: { userId } } } }
      ]
    },
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } }
    }
  });
  res.json({ tasks });
});

router.post('/', async (req, res) => {
  const parse = createTaskSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  const { title, description, assigneeId, dueDate, projectId } = parse.data;
  if (!projectId) return res.status(400).json({ message: 'projectId is required' });

  const task = await prisma.task.create({
    data: {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      projectId,
      assigneeId: assigneeId || null
    }
  });

  res.status(201).json({ task });
});

router.patch('/:id', async (req, res) => {
  const parse = updateTaskSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: { project: { include: { members: true } } }
  });

  if (!task) return res.status(404).json({ message: 'Task not found' });

  const isMember = task.project.members.some(member => member.userId === req.user.id);
  if (!isMember) {
    return res.status(403).json({ message: 'Not authorized to update this task' });
  }

  const updatedTask = await prisma.task.update({
    where: { id: req.params.id },
    data: { status: parse.data.status }
  });

  res.json({ task: updatedTask });
});

export default router;
