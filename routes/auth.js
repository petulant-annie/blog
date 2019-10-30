const express = require('express');
const auth = express.Router();
const passport = require('passport');

const { User } = require('../models/index');
const getHash = require('../hash');
const infoLogger = require('../loggers/infoLogger').logger;

auth.post('/registration', async (req, res, next) => {
  try {

    const hash = await getHash(req.body.password);
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: `${hash}`,
    });
    infoLogger.info('create new user');

    passport.serializeUser((user, done) => {
      done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
      User.findById(id, function (err, user) {
        done(err, user);
      });
    });

    res.send({ data: user });
  } catch (err) { next(err); }
});

auth.post('/login', (req, res, next) => {
  passport.authenticate('local',
    (err, user) => {
      if (err) { return next(err); }
      res.send({ data: user });
    })(req, res, next);
});

auth.post('/logout', (req, res, next) => {
  try {
    req.logout();
    infoLogger.info('logout');
    res.redirect('/login')
  } catch (err) { next(err); }
});

module.exports = auth;
