const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied, not an admin' });
  }
};

module.exports = verifyAdmin;