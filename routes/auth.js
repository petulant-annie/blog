const express = require('express');
const auth = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const { User } = require('../models/index');
const viewsScheme = require('../schemes/viewsScheme');
const Views = mongoose.model('articles_views', viewsScheme);
const getHash = require('../hash');
const isLoggedIn = require('../config/isLogged');
const infoLogger = require('../loggers/infoLogger').logger;
const asyncMiddleware = require('../asyncMiddleware');

auth.put('/profile', isLoggedIn, asyncMiddleware(async (req, res) => {
  await User.update({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  }, {
    where: { id: req.user }
  });
  const user = await User.findOne({ where: { id: req.user } })
  infoLogger.info(`update ${req.body.firstName} user`);

  res.send({ data: user });
}));

auth.delete('/profile', isLoggedIn, asyncMiddleware(async (req, res) => {
  const users = await User.destroy({
    where: { id: req.user }
  });

  await Views.deleteMany({ authorId: req.user });
  infoLogger.info('delete user');

  res.send({ data: users });
}));


auth.post('/registration', asyncMiddleware(async (req, res) => {
  const hash = await getHash(req.body.password);
  const user = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: `${hash}`,
  });

  req.login(user, (err) => {
    if (err) { throw err }
    infoLogger.info('create new user');
    res.send({ data: user });
  });
}));

auth.post('/login', asyncMiddleware((req, res, next) => {
  passport.authenticate('local',
    (err, user) => {
      if (err) { return next(err); }

      req.login(user.id, (err) => {
        if (err) { throw err }
        infoLogger.info('login user');
      });
      res.send({ data: user });
    })(req, res, next);
}));

auth.post('/logout', asyncMiddleware((req, res) => {
  req.logout();
  infoLogger.info('logout');
  res.send({});
}));

passport.serializeUser((currentId, done) => {
  done(null, currentId);
});

passport.deserializeUser((currentId, done) => {
  done(null, currentId);
});

module.exports = auth;
