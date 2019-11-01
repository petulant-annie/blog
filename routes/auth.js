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
    where: { id: req.user.id }
  });
  const user = await User.findOne({ where: { id: req.user.id } })
  infoLogger.info(`update ${req.body.firstName} user`);

  res.send({ data: user });
}));

auth.delete('/profile', isLoggedIn, asyncMiddleware(async (req, res) => {
  console.log(req.user)
  const users = await User.destroy({
    where: { id: req.user.id }
  });

  await Views.deleteMany({ authorId: req.user.id });
  infoLogger.info(`delete user id:${req.user.id}`);

  res.send({ data: users });
}));


auth.post('/registration', asyncMiddleware(async (req, res) => {
  const hash = await getHash(req.body.password);
  const user = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: hash,
  });

  req.login(user, (err) => {
    if (err) { throw err }
    infoLogger.info('create new user');
    res.send({ data: user });
  });
}));

auth.post('/login', passport.authenticate('local'), (req, res) => {
  res.send({ data: req.user });
});

auth.post('/logout', (req, res) => {
  req.logout();
  infoLogger.info('logout');
  res.send({});
});

passport.serializeUser((currentId, done) => {
  done(null, currentId);
});

passport.deserializeUser((currentId, done) => {
  done(null, currentId);
});

module.exports = auth;
