import { pool } from './connection';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

async function migrate(): Promise<void> {
  console.log('Running migrations...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const migrationsDir = join(__dirname, '..', 'migrations');

  const files = await readdir(migrationsDir);
  const sqlFiles = files.filter((f: string) => f.endsWith('.sql')).sort();

  const result = await pool.query('SELECT name FROM _migrations ORDER BY name');
  const executed = new Set(result.rows.map((r: { name: string }) => r.name));

  for (const file of sqlFiles) {
    if (executed.has(file)) {
      console.log(`  ✓ ${file} (already applied)`);
      continue;
    }

    const sql = await readFile(join(migrationsDir, file), 'utf-8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`  ✔ ${file}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`  ✖ ${file}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  console.log('Migrations complete.');
  await pool.end();
}

migrate().catch((err: unknown) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
