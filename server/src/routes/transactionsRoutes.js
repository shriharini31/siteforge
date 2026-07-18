import { Router } from 'express';
import protect from '../middleware/auth.js';
import { listTransactionsForBudget, createTransaction } from '../services/transactionsService.js';
import { getBudgetById } from '../services/budgetsService.js';

const router = Router();

router.get('/budgets/:budgetId/transactions', protect, async (req, res, next) => {
  try {
    const budget = await getBudgetById(req.params.budgetId);
    if (!budget) return res.status(404).json({ data: null, error: 'Budget not found', meta: { status: 404 } });

    const items = await listTransactionsForBudget(req.params.budgetId);
    res.json({ data: items, error: null, meta: { status: 200 } });
  } catch (err) {
    next(err);
  }
});

router.post('/budgets/:budgetId/transactions', protect, async (req, res, next) => {
  try {
    const budget = await getBudgetById(req.params.budgetId);
    if (!budget) return res.status(404).json({ data: null, error: 'Budget not found', meta: { status: 404 } });

    // role check could be added here (finance/admin)
    const result = await createTransaction(req.params.budgetId, req.body, req.user.sub);
    res.status(201).json({ data: result, error: null, meta: { status: 201 } });
  } catch (err) {
    next(err);
  }
});

export default router;
