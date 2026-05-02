import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { createProjectSchema } from '../utils/validators.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const userId = req.user.id;
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } }
      ]
    },
    include: {
      owner: { select: { id: true, name: true } },
      members: { select: { user: { select: { id: true, name: true } }, role: true } },
      tasks: true
    }
  });
  res.json({ projects });
});

router.post('/', async (req, res) => {
  const parse = createProjectSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  const { name, description } = parse.data;
  const project = await prisma.project.create({
    data: {
      name,
      description,
      ownerId: req.user.id,
      members: {
        create: {
          userId: req.user.id,
          role: 'ADMIN'
        }
      }
    }
  });

  res.status(201).json({ project });
});

export default router;
