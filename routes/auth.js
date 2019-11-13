const express = require('express');
const auth = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const { User, Article } = require('../models/index');
const viewsScheme = require('../schemes/viewsScheme');
const Views = mongoose.model('articles_views', viewsScheme);
const getHash = require('../hash');
const isLoggedIn = require('../config/isLogged');
const infoLogger = require('../loggers/infoLogger').logger;
const asyncMiddleware = require('../asyncMiddleware');
const { loginLimiter } = require('../limiter');
const getTokens = require('../getTokens');
const google = require('../google-cloud-storage');

auth.put('/profile', isLoggedIn, asyncMiddleware(async (req, res) => {
  await User.update({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  }, {
    where: { id: req.user.id }
  });
  const user = await User.findOne({ where: { id: req.user.id } })
  infoLogger.info(`update ${req.body.id} user`);

  res.send({ data: user });
}));

auth.put('/profile/picture', isLoggedIn,
  google.upload.single('picture'),
  google.sendUploadToGCS,
  asyncMiddleware(async (req, res) => {
    await User.update({
      picture: req.file.gcsUrl,
    }, {
      where: { id: req.user.id }
    });
    const user = await User.findOne({ where: { id: req.user.id } })
    infoLogger.info(`update ${req.body.id} user`);

    res.send({ data: user });
  }));

auth.delete('/profile', isLoggedIn, asyncMiddleware(async (req, res) => {
  const avatar = await User.findOne({ where: { id: req.user.id } });
  if (avatar.picture) {
    google.deleteFromGCS(avatar.picture);
    const pictures = await Article.findAll({ where: { authorId: req.user.id } });
    pictures.map(item => { google.deleteFromGCS(item.picture); });
  }

  const users = await User.destroy({ where: { id: req.user.id } });
  await Views.deleteMany({ authorId: req.user.id });
  infoLogger.info(`delete user id:${req.user.id}`);

  res.send({ data: users });
}));

auth.post('/registration', asyncMiddleware(async (req, res) => {
  const hash = await getHash(req.body.password);
  const user = await User.findOrCreate({
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

auth.post('/login', loginLimiter, passport.authenticate('local'), (req, res) => {
  infoLogger.info('login');
  res.send({ data: req.user });
});

auth.post('/logout', (req, res) => {
  req.logout();
  infoLogger.info('logout');
  res.send({});
});

auth.get('/jwtencode', async (req, res) => {
  const token = await getTokens.getAccessToken(req.query.userName);
  res.send({ token });
});

auth.post('/jwtdecode', getTokens.verifyToken, async (req, res) => {
  jwt.verify(req.token, process.env.SESSION_SECRET, async (err, authData) => {
    if (err) {
      res.status(401).json(err);
    } else { res.send(authData); }
  });
});

passport.serializeUser((currentId, done) => {
  done(null, currentId);
});

passport.deserializeUser((currentId, done) => {
  done(null, currentId);
});

module.exports = auth;
