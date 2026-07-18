import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { getState } from '../data/store.js';
import protect from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();

const buildLineSummary = (line) => {
  const spentAmount = line.transactions.reduce((sum, entry) => sum + entry.amount, 0);
  const variance = line.plannedAmount - spentAmount;
  const percent = line.plannedAmount === 0 ? 0 : (spentAmount / line.plannedAmount) * 100;
  const status = percent > 100 ? 'over_budget' : percent >= 25 ? 'at_risk' : 'ok';

  return { id: line.id, name: line.name, plannedAmount: line.plannedAmount, spentAmount, variance, status };
};

router.post('/budget-lines', protect, requireRole('admin', 'pm', 'supervisor'), (req, res) => {
  const { name, plannedAmount, projectId, description } = req.body;
  const line = {
    id: randomUUID(),
    name,
    plannedAmount,
    projectId,
    description,
    transactions: [],
  };
  getState().budgetLines.push(line);
  res.status(201).json({ data: buildLineSummary(line), error: null, meta: { status: 201 } });
});

router.post('/budget-lines/:id/transactions', protect, requireRole('admin', 'pm', 'supervisor'), (req, res) => {
  const line = getState().budgetLines.find((entry) => entry.id === req.params.id);
  if (!line) {
    return res.status(404).json({ data: null, error: 'Budget line not found', meta: { status: 404 } });
  }

  const transaction = {
    id: randomUUID(),
    amount: Number(req.body.amount),
    type: req.body.type,
    description: req.body.description,
  };
  line.transactions.push(transaction);

  const summary = buildLineSummary(line);
  res.status(201).json({ data: summary, error: null, meta: { status: 201 } });
});

router.post('/resources', protect, requireRole('admin', 'pm', 'supervisor'), (req, res) => {
  const resource = { id: randomUUID(), ...req.body };
  getState().resources.push(resource);
  res.status(201).json({ data: resource, error: null, meta: { status: 201 } });
});

router.post('/resource-assignments', protect, requireRole('admin', 'pm', 'supervisor'), (req, res) => {
  const { resourceId, projectId, startDate, endDate, role } = req.body;
  const candidate = {
    id: randomUUID(),
    resourceId,
    projectId,
    startDate,
    endDate,
    role,
  };

  const overlap = getState().resourceAssignments.find((assignment) => {
    if (assignment.resourceId !== resourceId) return false;
    const startsBeforeEnd = assignment.endDate >= startDate;
    const endsAfterStart = assignment.startDate <= endDate;
    return startsBeforeEnd && endsAfterStart;
  });

  if (overlap) {
    return res.status(409).json({ data: { conflict: overlap }, error: 'Assignment conflict', meta: { status: 409 } });
  }

  getState().resourceAssignments.push(candidate);
  res.status(201).json({ data: candidate, error: null, meta: { status: 201 } });
});

router.post('/materials', protect, requireRole('admin', 'pm', 'supervisor'), (req, res) => {
  const material = {
    id: randomUUID(),
    name: req.body.name,
    quantityOnHand: Number(req.body.quantityOnHand),
    reorderThreshold: Number(req.body.reorderThreshold),
    unit: req.body.unit,
    budgetLineId: req.body.budgetLineId,
  };
  getState().materials.push(material);
  res.status(201).json({ data: material, error: null, meta: { status: 201 } });
});

router.post('/materials/:id/consume', protect, requireRole('admin', 'pm', 'supervisor'), (req, res) => {
  const material = getState().materials.find((entry) => entry.id === req.params.id);
  if (!material) {
    return res.status(404).json({ data: null, error: 'Material not found', meta: { status: 404 } });
  }

  const quantity = Number(req.body.quantity);
  const budgetLineId = req.body.budgetLineId;
  material.quantityOnHand -= quantity;

  const transaction = {
    id: randomUUID(),
    amount: quantity,
    type: 'spend',
    description: req.body.notes || 'Material consumption',
    budgetLineId,
  };
  getState().budgetTransactions.push(transaction);

  const line = getState().budgetLines.find((entry) => entry.id === budgetLineId);
  if (line) {
    line.transactions.push(transaction);
  }

  res.status(201).json({
    data: {
      material,
      budgetTransaction: transaction,
    },
    error: null,
    meta: { status: 201 },
  });
});

export default router;
