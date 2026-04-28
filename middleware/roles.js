const allowRoles = (...roles) => {
  return (req, res, next) => {
    const user = req.session.user;

    if (!user) {
      return res.status(401).send("Not authenticated");
    }

    if (!roles.includes(user.role)) {
      return res.status(403).send("Access denied: permissions");
    }

    next();
  };
};

module.exports = { allowRoles };