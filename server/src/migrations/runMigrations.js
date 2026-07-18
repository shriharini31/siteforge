import fs from 'fs/promises';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const migrationsDir = path.resolve(process.cwd(), 'migrations');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS applied_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `);

    const entries = await fs.readdir(migrationsDir);
    const files = entries.filter((f) => f.endsWith('.sql')).sort();

    const res = await client.query('SELECT filename FROM applied_migrations');
    const applied = new Set(res.rows.map((r) => r.filename));

    for (const file of files) {
      if (applied.has(file)) {
        console.log('Skipping already applied:', file);
        continue;
      }

      const filePath = path.join(migrationsDir, file);
      console.log('Applying migration:', file);
      const sql = await fs.readFile(filePath, 'utf8');

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO applied_migrations(filename) VALUES($1)', [file]);
        await client.query('COMMIT');
        console.log('Applied:', file);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('Failed to apply', file, err);
        throw err;
      }
    }

    console.log('All migrations processed');
  } finally {
    try { client.release(); } catch (e) {}
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Migration run failed:', err);
  process.exit(1);
});
