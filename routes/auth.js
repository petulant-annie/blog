const express = require('express');
const auth = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { check } = require('express-validator');

const { User, Article } = require('../models/index');
const viewsScheme = require('../schemes/viewsScheme');
const Views = mongoose.model('articles_views', viewsScheme);
const getHash = require('../hash');
const isLoggedIn = require('../config/isLogged');
const infoLogger = require('../loggers/infoLogger').logger;
const asyncMiddleware = require('../asyncMiddleware');
const { loginLimiter } = require('../limiter');
const validation = require('../validation');
const getTokens = require('../jwt');
const google = require('../google-cloud-storage');
const sg = require('../sendgrid-template');
const stripe = require('../stripe-template');

auth.put('/profile', isLoggedIn, asyncMiddleware(async (req, res) => {
  await User.update({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  }, {
    where: { id: req.user.id }
  });
  const user = await User.findOne({ where: { id: req.user.id } });
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
    const user = await User.findOne({ where: { id: req.user.id } });
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
    await validation.check(req, res);

    const link = `${process.env.FRONTED_VERIFY}/verify?token=${token}`;
    const token = await getTokens.getAccessToken(req.body.email);
    const hash = await getHash(req.body.password);
    const isUser = await User.findOne({ where: { email: req.body.email } });
    const createCustomer = await stripe.createCustomer(req.user.email);

    if (!isUser) {
      const user = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hash,
        isVerified: false,
        isPro: false,
        stripeCustomerId: createCustomer.id,
        stripeCardId: createCustomer.default_source,
      });

      sg.verification(req.body.email, link);
      infoLogger.info('registration new user');
      res.send({ data: user });
    }

    if (isUser.isVerified) {
      res.redirect(401, '/login');
    } else {
      sg.verification(req.body.email, link);
      infoLogger.info('new user email verification');
      res.send({ data: isUser });
    }
  })
);

auth.post('/registration/verify',
  asyncMiddleware(async (req, res) => {
    jwt.verify(req.body.token, process.env.SESSION_SECRET, async (err, authData) => {
      if (err) {
        res.status(403).json({ errors: [{ msg: 'Try to register again' }] });
      } else {
        const isUser = await User.findOne({ where: { email: authData.email } });
        req.login(isUser, (err) => {
          if (err) { throw err; }
          infoLogger.info('verify new user');
          res.send({ data: isUser });
        });
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
    validation.check(req, res);

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

auth.put('/profile/card', asyncMiddleware(async (req, res) => {
  const user = await User.findOne({ where: { id: req.user.id } });
  const nestedUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    picture: user.picture,
    is_verified: user.isVerified,
    is_pro: user.isPro,
    stripe_customer_id: user.stripeCustomerId,
    stripe_card_id: user.stripeCardId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  res.send({ data: nestedUser });
}));

auth.get('/fees', asyncMiddleware(async (req, res) => {
  res.send({ data: { amount: 100 } });
}));

auth.put('/fees', asyncMiddleware(async (req, res) => {
  const centsAmount = req.body.amount * 100;
  const charge = await stripe.createCharge(
    req.user.stripeCustomerId, centsAmount, req.user.email, req.user.stripeCardId);

  if (centsAmount >= 10000) {
    await User.update({ isPro: true }, { where: { id: req.user.id } });
    sg.pro(req.user.email);
  }
  const user = await User.findOne({ where: { id: req.user.id } });

  sg.payments(user.email, charge.receipt_url);
  res.send({ data: { user, amount: centsAmount } });
}));

module.exports = auth;
