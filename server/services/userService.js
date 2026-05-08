const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const AppError = require("../utils/AppError");
const { mapUser } = require("../utils/mappers");

async function createUser(payload) {
  const passwordHash = await bcrypt.hash(payload.password, 10);

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO users (full_name, email, password_hash, role, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, full_name, email, role, status, created_at, updated_at
      `,
      [
        payload.fullName,
        payload.email.toLowerCase(),
        passwordHash,
        payload.role,
        payload.status || "active",
      ]
    );
    return mapUser(rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError(409, "A user with this email already exists.");
    }
    throw error;
  }
}

async function listUsers() {
  const { rows } = await pool.query(
    `
    SELECT id, full_name, email, role, status, created_at, updated_at
    FROM users
    ORDER BY created_at DESC
    `
  );
  return rows.map(mapUser);
}

async function getUserById(userId) {
  const { rows } = await pool.query(
    `
    SELECT id, full_name, email, role, status, created_at, updated_at
    FROM users
    WHERE id = $1
    `,
    [userId]
  );

  if (rows.length === 0) {
    throw new AppError(404, "User not found.");
  }

  return mapUser(rows[0]);
}

async function updateUser(userId, payload, actorId) {
  const { rows: existingRows } = await pool.query(
    "SELECT id, full_name, email, role, status, created_at, updated_at FROM users WHERE id = $1",
    [userId]
  );

  if (existingRows.length === 0) {
    throw new AppError(404, "User not found.");
  }

  const existingUser = existingRows[0];
  if (existingUser.id === actorId && payload.status === "inactive") {
    throw new AppError(400, "You cannot deactivate your own account.");
  }

  const updates = [];
  const values = [];
  let parameterPosition = 1;

  if (payload.fullName !== undefined) {
    updates.push(`full_name = $${parameterPosition++}`);
    values.push(payload.fullName);
  }
  if (payload.role !== undefined) {
    updates.push(`role = $${parameterPosition++}`);
    values.push(payload.role);
  }
  if (payload.status !== undefined) {
    updates.push(`status = $${parameterPosition++}`);
    values.push(payload.status);
  }

  updates.push(`updated_at = NOW()`);

  values.push(userId);

  const { rows } = await pool.query(
    `
    UPDATE users
    SET ${updates.join(", ")}
    WHERE id = $${parameterPosition}
    RETURNING id, full_name, email, role, status, created_at, updated_at
    `,
    values
  );

  return mapUser(rows[0]);
}

async function deactivateUser(userId, actorId) {
  const { rows: existingRows } = await pool.query(
    "SELECT id, status FROM users WHERE id = $1",
    [userId]
  );

  if (existingRows.length === 0) {
    throw new AppError(404, "User not found.");
  }

  if (userId === actorId) {
    throw new AppError(400, "You cannot deactivate your own account.");
  }

  const { rows } = await pool.query(
    `
    UPDATE users
    SET status = 'inactive', updated_at = NOW()
    WHERE id = $1
    RETURNING id, full_name, email, role, status, created_at, updated_at
    `,
    [userId]
  );

  return mapUser(rows[0]);
}

async function deleteUserPermanently(userId, actorId) {
  const { rows: existingRows } = await pool.query(
    "SELECT id FROM users WHERE id = $1",
    [userId]
  );

  if (existingRows.length === 0) {
    throw new AppError(404, "User not found.");
  }

  if (userId === actorId) {
    throw new AppError(400, "You cannot delete your own account.");
  }

  try {
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
  } catch (error) {
    if (error.code === "23503") {
      throw new AppError(
        409,
        "Cannot permanently delete user because related financial records exist. Deactivate the user instead."
      );
    }
    throw error;
  }
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deactivateUser,
  deleteUserPermanently,
};
