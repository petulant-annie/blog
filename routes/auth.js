const express = require('express');
const auth = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

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
const sg = require('../sendgrid-template');

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

auth.put('/profile/picture',
  isLoggedIn,
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

auth.post('/registration',
  [
    check('email').isEmail(),
    check('password').isLength({ min: 5 }).exists(),
  ],
  asyncMiddleware(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const hash = await getHash(req.body.password);
    const isUser = await User.findOne({ where: { email: req.body.email } });

    const token = await getTokens.getAccessToken(req.body.email);
    const link = `${process.env.FRONTED_VERIFY}/verify?token=${token}`;

    if (!isUser) {
      const user = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hash,
        isVerified: false,
      });

      sg.sendgrid(req.body.email, link);
      infoLogger.info('registration new user');
      res.send({ data: user });
    }

    if (isUser.isVerified) {
      res.redirect(401, '/login');
    } else {
      sg.sendgrid(req.body.email, link);
      infoLogger.info('new user email verification');
      res.send({ data: isUser });
    }
  })
);

auth.post('/registration/verify',
  asyncMiddleware(async (req, res) => {
    jwt.verify(req.body.token, process.env.SESSION_SECRET, async (err, authData) => {
      if (err) {
        res.status(401).json(err);
      } else {
        const isUser = await User.findOne({ where: { email: authData.email } });
        res.send({ data: isUser })
      }
    });
  })
);

auth.post('/login',
  [
    check('email').isEmail(),
    check('password').isLength({ min: 5 }),
  ],
  loginLimiter,
  passport.authenticate('local'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    infoLogger.info('login');
    res.send({ data: req.user });
  }
);

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

auth.post('/logout', (req, res) => {
  req.logout();
  infoLogger.info('logout');
  res.send({});
});

module.exports = auth;