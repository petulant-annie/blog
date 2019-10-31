const express = require('express');
const usersRouter = express.Router();
const mongoose = require('mongoose');

const { User, Article } = require('../models/index');
const sequelize = require('../dbConnection');
const viewsScheme = require('../schemes/viewsScheme');
const Views = mongoose.model('articles_views', viewsScheme);
const infoLogger = require('../loggers/infoLogger').logger;
const asyncMiddleware = require('../asyncMiddleware');

usersRouter.get('/', asyncMiddleware(async (req, res) => {
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
      const reduce = count.reduce((total, amount) => { return total + amount }, 0);

      return { ...item, viewsCount: reduce };
    }
    return { ...item }
  });
  infoLogger.info('get all users');

  res.send({ data: mapped });
}));

usersRouter.get('/:id', asyncMiddleware(async (req, res) => {
  const user = await User.findOne({ where: { id: req.params.id } });
  infoLogger.info(`get id:${req.params.id} user`);

  res.send({ data: user });
}));

usersRouter.get('/:id/blog', asyncMiddleware(async (req, res) => {
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
}));

module.exports = usersRouter;