function errorHandler(err, _req, res, _next) {
  // Allow services/controllers to throw either plain Error or a custom object.
  let status = err?.status || err?.statusCode || 500;
  let message = err?.message || "Internal server error";

  // Map common Postgres errors to HTTP.
  // https://www.postgresql.org/docs/current/errcodes-appendix.html
  const pgCode = err?.code;
  if (pgCode === "23505") {
    // unique_violation
    status = 409;
    message = "Conflict: duplicate resource";
  } else if (pgCode === "22P02") {
    // invalid_text_representation (often invalid uuid)
    status = 400;
    message = "Invalid ID format";
  } else if (pgCode === "23503") {
    // foreign_key_violation
    status = 400;
    message = "Invalid reference";
  }

  const isDev = process.env.NODE_ENV !== "production";
  const includeDetails = isDev && process.env.ERROR_DETAILS === "true";

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  const payload = {
    error: {
      message,
      ...(includeDetails
        ? {
            details: {
              status,
              pgCode: pgCode || null,
              stack: err?.stack || null,
            },
          }
        : {}),
    },
  };

  return res.status(status).json(payload);
}

module.exports = { errorHandler };
