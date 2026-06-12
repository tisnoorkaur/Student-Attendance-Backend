/**
 * Global error handling middleware.
 * Catches all errors thrown or passed via next(err) in the request pipeline.
 */
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  console.error(`[ERROR] ${status} - ${message}`);
  console.error(err.stack || err);

  res.status(status).json({
    success: false,
    message,
    status,
  });
}
