const app = require("./app");
const env = require("./config/env");
const pool = require("./config/db");

async function ensureSchemaCompatibility() {
  await pool.query(`
    ALTER TABLE IF EXISTS financial_records
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ
  `);
  await pool.query(`
    UPDATE users
    SET role = 'viewer'
    WHERE role = 'analyst'
  `);
  await pool.query(`
    ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_role_check
  `);
  await pool.query(`
    ALTER TABLE users
    ADD CONSTRAINT users_role_check CHECK (role IN ('viewer', 'admin'))
  `);
}

async function start() {
  try {
    await ensureSchemaCompatibility();
    app.listen(env.port, () => {
      console.log(`Finance dashboard backend listening on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

start();
