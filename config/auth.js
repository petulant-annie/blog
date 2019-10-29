const errorLogger = require('../loggers/errorLogger').logger;

module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    errorLogger.error('Fail to login');
    res.redirect('/login');
  }
}