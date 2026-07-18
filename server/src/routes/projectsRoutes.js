import { Router } from 'express';
import protect from '../middleware/auth.js';
import { listProjects, createProject, getProjectById, updateProject, deleteProject } from '../services/projectsService.js';

const router = Router();

router.get('/', protect, async (req, res, next) => {
  try {
    const owner_id = req.query.owner_id;
    const items = await listProjects({ owner_id });
    res.json({ data: items, error: null, meta: { status: 200 } });
  } catch (err) {
    next(err);
  }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const body = req.body;
    const ownerId = body.owner_id || req.user.sub;
    const created = await createProject({ ...body, owner_id: ownerId });
    res.status(201).json({ data: created, error: null, meta: { status: 201 } });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ data: null, error: 'Not found', meta: { status: 404 } });
    res.json({ data: project, error: null, meta: { status: 200 } });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', protect, async (req, res, next) => {
  try {
    const existing = await getProjectById(req.params.id);
    if (!existing) return res.status(404).json({ data: null, error: 'Not found', meta: { status: 404 } });

    const isOwner = existing.owner_id === req.user.sub;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ data: null, error: 'Forbidden', meta: { status: 403 } });

    const updated = await updateProject(req.params.id, req.body);
    res.json({ data: updated, error: null, meta: { status: 200 } });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const existing = await getProjectById(req.params.id);
    if (!existing) return res.status(404).json({ data: null, error: 'Not found', meta: { status: 404 } });

    const isOwner = existing.owner_id === req.user.sub;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ data: null, error: 'Forbidden', meta: { status: 403 } });

    await deleteProject(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
