function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return res.redirect('/users/geoport');
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/users/login');
}

function checkRole(role) {
  return function (req, res, next) {
    if (req.isAuthenticated() && req.user.role_name === role) {
      return next();
    }
    req.flash('error_msg', 'You do not have permission to view this resource');
    res.redirect('/users/login');
  };
}

module.exports = { checkAuthenticated, checkNotAuthenticated ,checkRole};