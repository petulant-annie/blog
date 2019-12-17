const errorLogger = require('../loggers/errorLogger').logger;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  errorLogger.error('User is not logged in');
  return res.redirect('/login');
}

module.exports = isLoggedIn;