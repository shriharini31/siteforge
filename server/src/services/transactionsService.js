import pool from '../db/pool.js';

export const listTransactionsForBudget = async (budgetId) => {
  const res = await pool.query('SELECT * FROM budget_transactions WHERE budget_id = $1 ORDER BY created_at DESC', [budgetId]);
  return res.rows;
};

export const createTransaction = async (budgetId, data, userId) => {
  const { amount, type, note } = data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const insertText = 'INSERT INTO budget_transactions (budget_id, amount, type, note, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *';
    const insertRes = await client.query(insertText, [budgetId, amount, type, note || null, userId || null]);

    const updateText = 'UPDATE budgets SET amount_spent = amount_spent + $1, updated_at = now() WHERE id = $2 RETURNING *';
    const updateRes = await client.query(updateText, [amount, budgetId]);

    await client.query('COMMIT');
    return { transaction: insertRes.rows[0], budget: updateRes.rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
