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

auth.put('/profile', isLoggedIn, async (req, res, next) => {
  try {
    await User.update({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    }, {
      where: { id: req.session.passport.user }
    });
    const user = await User.findOne({ where: { id: req.session.passport.user } })
    infoLogger.info(`update ${req.body.firstName} user`);

    res.send({ data: user });
  } catch (err) { next(err); }
});

auth.delete('/profile', isLoggedIn, async (req, res, next) => {
  try {
    const users = await User.destroy({
      where: { id: req.session.passport.user }
    });

    await Views.deleteMany({ authorId: req.session.passport.user });
    infoLogger.info('delete user');

    res.send({ data: users });
  } catch (err) { next(err); }
});


auth.post('/registration', async (req, res, next) => {
  try {
    const hash = await getHash(req.body.password);
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: `${hash}`,
    });

    const currentId = user.dataValues.id;

    req.login(currentId, (err) => {
      if (err) { throw err }
      infoLogger.info('create new user');
      res.send({ data: user });
    });
  } catch (err) { next(err); }
});

auth.post('/login', (req, res, next) => {
  try {
    passport.authenticate('local',
      (err, user) => {
        if (err) { return next(err); }

        req.login(user.id, (err) => {
          if (err) { throw err }
          infoLogger.info('login user');
        });
        res.send({ data: user });
      })(req, res, next);

  } catch (err) { next(err); }
});

auth.post('/logout', (req, res, next) => {
  try {
    req.logout();
    infoLogger.info('logout');
    res.redirect('/login')
  } catch (err) { next(err); }
});

passport.serializeUser((currentId, done) => {
  done(null, currentId);
});

passport.deserializeUser((currentId, done) => {
  done(null, currentId);
});

module.exports = auth;
