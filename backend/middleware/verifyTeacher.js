module.exports = (req, res, next) => {
    if (req.user.role !== 'Teacher') {
      return res.status(403).json({ msg: 'Access denied. Teacher role required.' });
    }
    next();
  };
  