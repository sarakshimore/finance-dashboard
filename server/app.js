const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const YAML = require("yamljs");
const swaggerUi = require("swagger-ui-express");
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const recordRoutes = require("./routes/recordRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { apiRateLimiter } = require("./middleware/rateLimiter");
const requestLogger = require("./middleware/requestLogger");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use("/api/v1", apiRateLimiter);

const openApiPath = path.join(__dirname, "docs", "openapi.yaml");
const openApiDocument = YAML.load(openApiPath);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

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

const apiV1Router = express.Router();
apiV1Router.use("/auth", authRoutes);
apiV1Router.use("/users", userRoutes);
apiV1Router.use("/records", recordRoutes);
apiV1Router.use("/dashboard", dashboardRoutes);

app.use("/api/v1", apiV1Router);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
