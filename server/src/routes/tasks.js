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

export default router;
