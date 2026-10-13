export function notFound(req, res, next) {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Server error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  if (err.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyValue || {}).join(', ');
    message = `Duplicate value for: ${fields}`;
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier';
  }

  const body = { message };
  if (process.env.NODE_ENV !== 'production') {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}
