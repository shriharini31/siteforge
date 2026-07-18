import pool from '../db/pool.js';

export const listProjects = async (filters = {}) => {
  const { owner_id } = filters;
  if (owner_id) {
    const res = await pool.query('SELECT * FROM projects WHERE owner_id = $1 ORDER BY created_at DESC', [owner_id]);
    return res.rows;
  }

  const res = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
  return res.rows;
};

export const createProject = async (data) => {
  const { title, owner_id, status, start_date, end_date } = data;
  const res = await pool.query(
    'INSERT INTO projects (title, owner_id, status, start_date, end_date) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [title, owner_id, status || 'draft', start_date || null, end_date || null]
  );
  return res.rows[0];
};

export const getProjectById = async (id) => {
  const res = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
  return res.rows[0] || null;
};

export const updateProject = async (id, fields = {}) => {
  const keys = Object.keys(fields);
  if (keys.length === 0) return getProjectById(id);

  const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const values = keys.map((k) => fields[k]);
  values.push(id);

  const res = await pool.query(`UPDATE projects SET ${sets}, updated_at = now() WHERE id = $${values.length} RETURNING *`, values);
  return res.rows[0];
};

export const deleteProject = async (id) => {
  await pool.query('DELETE FROM projects WHERE id = $1', [id]);
  return true;
};
