module.exports = function roleCheck(roles = []) {
  return function handler(req, res, next) {
    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền truy cập' },
      });
    }
    return next();
  };
};
