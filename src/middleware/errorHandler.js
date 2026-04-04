function notFound(_req, res) {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
}

function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const payload = {
    success: false,
    message: err.message || "Internal server error.",
  };

  if (err.details) {
    payload.details = err.details;
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json(payload);
}

module.exports = {
  notFound,
  errorHandler,
};
