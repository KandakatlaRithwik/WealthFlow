function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err.stack || err.message);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'A record with that value already exists.' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid identifier supplied.' });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    message: status === 500 ? 'Something went wrong on our end. Please try again.' : err.message,
  });
}

module.exports = { notFound, errorHandler };
