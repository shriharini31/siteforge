import { Router } from 'express';
import protect from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';
import pool from '../db/pool.js';

const router = Router();

router.get('/', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const q = await pool.query('SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC');
    res.json({ data: q.rows, error: null, meta: { status: 200 } });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const id = req.params.id;
    if (req.user.sub !== id && req.user.role !== 'admin') {
      return res.status(403).json({ data: null, error: 'Forbidden', meta: { status: 403 } });
    }

    const q = await pool.query('SELECT id, name, email, role, status, created_at FROM users WHERE id = $1', [id]);
    const user = q.rows[0];
    if (!user) return res.status(404).json({ data: null, error: 'Not found', meta: { status: 404 } });
    res.json({ data: user, error: null, meta: { status: 200 } });
  } catch (err) {
    next(err);
  }
});

export default router;
