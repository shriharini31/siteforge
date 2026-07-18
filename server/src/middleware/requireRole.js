const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ data: null, error: 'Forbidden', meta: { status: 403 } });
  }

  next();
};

export default requireRole;
