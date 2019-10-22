const express = require('express');
const mongoose = require('mongoose');
const sequelize = require('../dbConnection');
const logger = require('../logger').logger;
const usersRouter = express.Router();

const { User, Article } = require('../models/index');
const viewsScheme = require('../schemes/viewsScheme');
const Views = mongoose.model('articles_views', viewsScheme);

usersRouter.get('/', async (req, res) => {
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
        let count = [0];
        articlesViews.find(element => {
          if (element.authorId === item.id) { count.push(element.views) }
        });
        let reduce = count.reduce((total, amount) => total + amount);

        return { ...item, viewsCount: reduce };
      }
      return { ...item }
    });

    res.send({ data: mapped });

  } catch (err) { logger.error(err, 'Error'); }
});

usersRouter.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id } });
    res.send({ data: user });
  } catch (err) { logger.error(err, 'Error'); }
});

usersRouter.post('/', async (req, res) => {
  try {
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
    })
    res.send({ data: user });
  } catch (err) { logger.error(err, 'Error'); }
});

usersRouter.put('/:id', async (req, res) => {
  try {
    const user = await User.update({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
    }, {
      where: {
        id: req.params.id
      }
    })
    res.send({ data: user });
  } catch (err) { logger.error(err, 'Error'); }
});

usersRouter.get('/:id/blog', async (req, res) => {
  try {
    const article = await Article.findAll({
      order: [['id', 'DESC']],
      include: [{ model: User, as: 'author' }],
      where: { authorId: req.params.id },
      raw: true,
      nest: true,
    })

    const articlesViews = await Views.find({}).exec();

    const mapped = article.map(item => {
      const viewsElement = articlesViews.find(element => element.articleId === item.id);
      return { ...item, views: viewsElement.views };
    });

    res.send({ data: mapped });
  } catch (err) { logger.error(err, 'Error'); }
});

usersRouter.delete('/:id', async (req, res) => {
  try {
    logger.info(req, `deleted ${req.params.authorId} articles`);
    const users = await User.destroy({
      where: { id: req.params.id }
    });

    await Views.deleteMany({ authorId: req.params.id }).exec();

    res.send({ data: users });
  } catch (err) { logger.error(err, 'Error'); }
});

module.exports = usersRouter;