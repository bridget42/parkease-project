function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  return res.redirect("/");
}

function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === "admin") {
    return next();
  }
  return res.status(403).send("Access denied: Admins only");
}

function isManagerOrAdmin(req, res, next) {
  if (
    req.session.user &&
    ["admin", "manager"].includes(req.session.user.role)
  ) {
    return next();
  }
  return res.status(403).send("Access denied: Managers or Admins only");
}

function isStaff(req, res, next) {
  if (
    req.session.user &&
    ["admin", "manager", "attendant"].includes(req.session.user.role)
  ) {
    return next();
  }
  return res.redirect("/");
}

module.exports = {
  isAuthenticated, isAdmin, isManagerOrAdmin, isStaff
};