const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const recordRoutes = require("./routes/recordRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { apiRateLimiter } = require("./middleware/rateLimiter");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/api", apiRateLimiter);

app.get("/health", async (_req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      success: true,
      message: "Service is healthy.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
