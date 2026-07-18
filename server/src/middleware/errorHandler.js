const errorHandler = (err, _req, res, _next) => {
  if (err?.name === 'ZodError') {
    return res.status(400).json({
      data: null,
      error: err.issues.map((issue) => ({ path: issue.path, message: issue.message })),
      meta: { status: 400 },
    });
  }

  const status = err?.status || 500;
  const message = status === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err?.message || 'Internal server error';

  res.status(status).json({ data: null, error: message, meta: { status } });
};

export default errorHandler;
