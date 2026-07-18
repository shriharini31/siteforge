import { Router } from 'express';
import protect from '../middleware/auth.js';
import { createBudgetForPhase, getBudgetById, updateBudget, listBudgetsForPhase } from '../services/budgetsService.js';
import { getPhaseById } from '../services/phasesService.js';

const router = Router();

router.get('/phases/:phaseId/budgets', protect, async (req, res, next) => {
  try {
    const phase = await getPhaseById(req.params.phaseId);
    if (!phase) return res.status(404).json({ data: null, error: 'Phase not found', meta: { status: 404 } });

    const items = await listBudgetsForPhase(req.params.phaseId);
    res.json({ data: items, error: null, meta: { status: 200 } });
  } catch (err) {
    next(err);
  }
});

router.post('/phases/:phaseId/budgets', protect, async (req, res, next) => {
  try {
    const phase = await getPhaseById(req.params.phaseId);
    if (!phase) return res.status(404).json({ data: null, error: 'Phase not found', meta: { status: 404 } });

    const created = await createBudgetForPhase(req.params.phaseId, req.body);
    res.status(201).json({ data: created, error: null, meta: { status: 201 } });
  } catch (err) {
    next(err);
  }
});

router.get('/budgets/:id', protect, async (req, res, next) => {
  try {
    const b = await getBudgetById(req.params.id);
    if (!b) return res.status(404).json({ data: null, error: 'Not found', meta: { status: 404 } });
    res.json({ data: b, error: null, meta: { status: 200 } });
  } catch (err) {
    next(err);
  }
});

router.patch('/budgets/:id', protect, async (req, res, next) => {
  try {
    const updated = await updateBudget(req.params.id, req.body);
    res.json({ data: updated, error: null, meta: { status: 200 } });
  } catch (err) {
    next(err);
  }
});

export default router;
