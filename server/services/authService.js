const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const AppError = require("../utils/AppError");
const { signAccessToken } = require("../utils/tokens");
const { mapUser } = require("../utils/mappers");

async function register(payload) {
  const passwordHash = await bcrypt.hash(payload.password, 10);

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO users (full_name, email, password_hash, role, status)
      VALUES ($1, $2, $3, 'viewer', 'active')
      RETURNING id, full_name, email, role, status, created_at, updated_at
      `,
      [payload.fullName, payload.email.toLowerCase(), passwordHash]
    );

    const user = rows[0];
    const token = signAccessToken({
      userId: user.id,
      role: user.role,
    });

    return {
      token,
      user: mapUser(user),
    };
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError(409, "A user with this email already exists.");
    }
    throw error;
  }
}

async function login(email, password) {
  const { rows } = await pool.query(
    `
    SELECT id, full_name, email, password_hash, role, status, created_at, updated_at
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  const user = rows[0];
  if (!user) {
    throw new AppError(401, "Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError(401, "Invalid email or password.");
  }

  if (user.status !== "active") {
    throw new AppError(403, "User account is inactive.");
  }

  const token = signAccessToken({
    userId: user.id,
    role: user.role,
  });

  return {
    token,
    user: mapUser(user),
  };
}

module.exports = { register, login };
