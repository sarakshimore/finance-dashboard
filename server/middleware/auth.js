const pool = require("../config/db");
const AppError = require("../utils/AppError");
const { verifyAccessToken } = require("../utils/tokens");

async function auth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "Missing or invalid authorization token.");
    }

    const token = authHeader.split(" ")[1];
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (_error) {
      throw new AppError(401, "Invalid or expired token.");
    }

    const { rows } = await pool.query(
      `
      SELECT id, full_name, email, role, status
      FROM users
      WHERE id = $1
      `,
      [payload.userId]
    );

    if (rows.length === 0) {
      throw new AppError(401, "User not found for the provided token.");
    }

    const user = rows[0];
    if (user.status !== "active") {
      throw new AppError(403, "Your account is inactive.");
    }

    req.user = {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = auth;
