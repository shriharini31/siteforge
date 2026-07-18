import pool from '../db/pool.js';

export const listPhasesForProject = async (projectId) => {
  const res = await pool.query('SELECT * FROM phases WHERE project_id = $1 ORDER BY created_at DESC', [projectId]);
  return res.rows;
};

export const createPhase = async (projectId, data) => {
  const { title, status, start_date, end_date } = data;
  const res = await pool.query(
    'INSERT INTO phases (project_id, title, status, start_date, end_date) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [projectId, title, status || 'planned', start_date || null, end_date || null]
  );
  return res.rows[0];
};

export const getPhaseById = async (id) => {
  const res = await pool.query('SELECT * FROM phases WHERE id = $1', [id]);
  return res.rows[0] || null;
};

export const updatePhase = async (id, fields = {}) => {
  const keys = Object.keys(fields);
  if (keys.length === 0) return getPhaseById(id);

  const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const values = keys.map((k) => fields[k]);
  values.push(id);

  const res = await pool.query(`UPDATE phases SET ${sets}, updated_at = now() WHERE id = $${values.length} RETURNING *`, values);
  return res.rows[0];
};

export const deletePhase = async (id) => {
  await pool.query('DELETE FROM phases WHERE id = $1', [id]);
  return true;
};
