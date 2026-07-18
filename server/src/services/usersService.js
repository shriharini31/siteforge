import pool from '../db/pool.js';

export const createUser = async (name, email, password_hash, role = 'client-viewer') => {
  const sql = `
    INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at
  `;
  const values = [name, email, password_hash, role];
  const { rows } = await pool.query(sql, values);
  return rows[0];
};

export const getUserByEmail = async (email) => {
  const sql = `SELECT id, name, email, role, password_hash FROM users WHERE email = $1 LIMIT 1`;
  const { rows } = await pool.query(sql, [email]);
  return rows[0] || null;
};

export const getUserById = async (id) => {
  const sql = `SELECT id, name, email, role FROM users WHERE id = $1 LIMIT 1`;
  const { rows } = await pool.query(sql, [id]);
  return rows[0] || null;
};
