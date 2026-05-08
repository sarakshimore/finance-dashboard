const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setup() {
  const client = await pool.connect();
  try {
    const schemaPath = path.join(__dirname, "..", "db", "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    await client.query("BEGIN");
    await client.query(schemaSql);
    await client.query(`
      ALTER TABLE financial_records
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ
    `);
    await client.query(`
      UPDATE users
      SET role = 'viewer'
      WHERE role = 'analyst'
    `);
    await client.query(`
      ALTER TABLE users
      DROP CONSTRAINT IF EXISTS users_role_check
    `);
    await client.query(`
      ALTER TABLE users
      ADD CONSTRAINT users_role_check CHECK (role IN ('viewer', 'admin'))
    `);

    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@finance.local";
    const adminName = process.env.DEFAULT_ADMIN_NAME || "System Admin";
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin12345";
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await client.query(
      `
      INSERT INTO users (full_name, email, password_hash, role, status)
      VALUES ($1, $2, $3, 'admin', 'active')
      ON CONFLICT (email) DO NOTHING
      `,
      [adminName, adminEmail, passwordHash]
    );

    await client.query("COMMIT");
    console.log("Database setup complete.");
    console.log(`Default admin email: ${adminEmail}`);
    console.log("Default admin password:", adminPassword);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

setup();
