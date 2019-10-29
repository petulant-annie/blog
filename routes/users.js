const express = require('express');
const usersRouter = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const { User, Article } = require('../models/index');
const sequelize = require('../dbConnection');
const viewsScheme = require('../schemes/viewsScheme');
const Views = mongoose.model('articles_views', viewsScheme);
const infoLogger = require('../loggers/infoLogger').logger;
const getHash = require('../hash');
const { ensureAuthenticated } = require('../config/auth');

usersRouter.get('/users', async (req, res, next) => {
  try {
    const users = await sequelize.query(
      `select users.*, COUNT(authorId) 
    AS articlesCount FROM users LEFT JOIN articles 
    ON articles.authorId=users.id GROUP BY users.id`,
      {
        raw: true,
        nest: true,
      });

    const articlesViews = await Views.find({});

    const mapped = await users.map(item => {
      if (articlesViews.length) {
        let count = [];
        articlesViews.forEach(element => {
          if (element.authorId === item.id) { count.push(element.views) }
        });
        let reduce = count.reduce((total, amount) => { total + amount }, 0);

        return { ...item, viewsCount: reduce };
      }
      return { ...item }
    });
    infoLogger.info('get all users');

    res.send({ data: mapped });
  } catch (err) { next(err); }
});

usersRouter.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id } });
    infoLogger.info(`get id:${req.params.id} user`);

    res.send({ data: user });
  } catch (err) { next(err); }
});

//Registration user

usersRouter.post('/registration', async (req, res, next) => {
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

usersRouter.put('/profile', async (req, res, next) => {
  try {
    const user = await User.update({
      firstName: req.body.firstName,
      lastName: req.body.lastName
    }, {
      where: { id: req.params.id }
    });
    infoLogger.info(`update ${req.body.firstName} user`);

    res.send({ data: user });
  } catch (err) { next(err); }
});

usersRouter.get('/users/:id/blog', async (req, res, next) => {
  try {
    const article = await Article.findAll({
      order: [['id', 'DESC']],
      include: [{ model: User, as: 'author' }],
      where: { authorId: req.params.id },
      raw: true,
      nest: true,
    });
    const articlesViews = await Views.find({});

    const mapped = article.map(item => {
      const viewsElement = articlesViews.find(element => element.articleId === item.id);
      return { ...item, views: viewsElement.views };
    });
    infoLogger.info('get user blog');

    res.send({ data: mapped });
  } catch (err) { next(err); }
});

usersRouter.delete('/profile', ensureAuthenticated, async (req, res, next) => {
  try {
    const users = await User.destroy({
      where: { id: req.params.id }
    });

    await Views.deleteMany({ authorId: req.params.id });
    infoLogger.info('delete user');

    res.send({ data: users });
  } catch (err) { next(err); }
});

usersRouter.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/registration',
  })(req, res, next)
});

usersRouter.post('/logout', (req, res, next) => {
  try {
    req.logout();
    infoLogger.info('logout');
    res.redirect('/login')
  } catch (err) { next(err); }
});

module.exports = usersRouter;