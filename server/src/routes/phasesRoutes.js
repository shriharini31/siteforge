import { Router } from 'express';
import protect from '../middleware/auth.js';
import { listPhasesForProject, createPhase, getPhaseById, updatePhase, deletePhase } from '../services/phasesService.js';
import { getProjectById } from '../services/projectsService.js';

const router = Router();

router.get('/projects/:projectId/phases', protect, async (req, res, next) => {
  try {
    const project = await getProjectById(req.params.projectId);
    if (!project) return res.status(404).json({ data: null, error: 'Project not found', meta: { status: 404 } });

    const items = await listPhasesForProject(req.params.projectId);
    res.json({ data: items, error: null, meta: { status: 200 } });
  } catch (err) {
    next(err);
  }
});

router.post('/projects/:projectId/phases', protect, async (req, res, next) => {
  try {
    const project = await getProjectById(req.params.projectId);
    if (!project) return res.status(404).json({ data: null, error: 'Project not found', meta: { status: 404 } });

    // ownership/admin check
    const isOwner = project.owner_id === req.user.sub;
    const canManagePhases = isOwner || ['admin', 'pm'].includes(req.user.role);
    if (!canManagePhases) return res.status(403).json({ data: null, error: 'Forbidden', meta: { status: 403 } });

    const created = await createPhase(req.params.projectId, req.body);
    res.status(201).json({ data: created, error: null, meta: { status: 201 } });
  } catch (err) {
    next(err);
  }
});

router.get('/phases/:id', protect, async (req, res, next) => {
  try {
    const phase = await getPhaseById(req.params.id);
    if (!phase) return res.status(404).json({ data: null, error: 'Not found', meta: { status: 404 } });
    res.json({ data: phase, error: null, meta: { status: 200 } });
  } catch (err) {
    next(err);
  }
});

router.patch('/phases/:id', protect, async (req, res, next) => {
  try {
    const phase = await getPhaseById(req.params.id);
    if (!phase) return res.status(404).json({ data: null, error: 'Not found', meta: { status: 404 } });

    const project = await getProjectById(phase.project_id);
    const isOwner = project && project.owner_id === req.user.sub;
    const canManagePhases = isOwner || ['admin', 'pm'].includes(req.user.role);
    if (!canManagePhases) return res.status(403).json({ data: null, error: 'Forbidden', meta: { status: 403 } });

    const updated = await updatePhase(req.params.id, req.body);
    res.json({ data: updated, error: null, meta: { status: 200 } });
  } catch (err) {
    next(err);
  }
});

router.delete('/phases/:id', protect, async (req, res, next) => {
  try {
    const phase = await getPhaseById(req.params.id);
    if (!phase) return res.status(404).json({ data: null, error: 'Not found', meta: { status: 404 } });

    const project = await getProjectById(phase.project_id);
    const isOwner = project && project.owner_id === req.user.sub;
    const canManagePhases = isOwner || ['admin', 'pm'].includes(req.user.role);
    if (!canManagePhases) return res.status(403).json({ data: null, error: 'Forbidden', meta: { status: 403 } });

    await deletePhase(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
