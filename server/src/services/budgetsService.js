import pool from '../db/pool.js';

export const createBudgetForPhase = async (phaseId, data) => {
  const { amount_allocated, currency } = data;
  const res = await pool.query(
    'INSERT INTO budgets (phase_id, amount_allocated, amount_spent, currency) VALUES ($1,$2,0,$3) RETURNING *',
    [phaseId, amount_allocated || 0, currency || 'USD']
  );
  return res.rows[0];
};

export const getBudgetById = async (id) => {
  const res = await pool.query('SELECT * FROM budgets WHERE id = $1', [id]);
  return res.rows[0] || null;
};

export const updateBudget = async (id, fields = {}) => {
  const keys = Object.keys(fields);
  if (keys.length === 0) return getBudgetById(id);

  const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const values = keys.map((k) => fields[k]);
  values.push(id);

  const res = await pool.query(`UPDATE budgets SET ${sets}, updated_at = now() WHERE id = $${values.length} RETURNING *`, values);
  return res.rows[0];
};

export const listBudgetsForPhase = async (phaseId) => {
  const res = await pool.query('SELECT * FROM budgets WHERE phase_id = $1 ORDER BY created_at DESC', [phaseId]);
  return res.rows;
};
