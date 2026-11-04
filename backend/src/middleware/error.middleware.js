export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;

  return res.status(status).json({
    message: status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : (err.message || 'Server Error'),
  });
}
