const express = require('express');
const mongoose = require('mongoose');
const sequelize = require('../dbConnection');
const usersRouter = express.Router();

const { User, Article } = require('../models/index');
const viewsScheme = require('../schemes/viewsScheme');
const Views = mongoose.model('articles_views', viewsScheme);

usersRouter.get('/', async (req, res, next) => {
  try {
    const users = await sequelize.query(
      `select users.*, COUNT(authorId) 
    AS articles FROM users LEFT JOIN articles 
    ON articles.authorId=users.id GROUP BY users.id`,
      {
        raw: true,
        nest: true,
      });

    res.send({ data: users })
  } catch (err) { next(err) }
});

usersRouter.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id } })
    res.send({ data: user })
  } catch (err) { next(err) }
});

usersRouter.post('/', async (req, res, next) => {
  try {
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
    })
    res.send({ data: user })
  } catch (err) { next(err) }
});

usersRouter.put('/:id', async (req, res, next) => {
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
  } catch (err) { next(err) }
});

usersRouter.get('/:id/blog', async (req, res, next) => {
  try {
    const article = await Article.findAll({
      order: [['id', 'DESC']],
      include: [{ model: User, as: 'author' }],
      where: { authorId: req.params.id },
      raw: true,
      nest: true,
    })

    const articlesViews = await Views.find({}, (err, result) => {
      if (err) { return console.log(err); }
      return result;
    });

    const mapped = article.map(item => {
      const viewsElement = articlesViews.find(element => element.articleId === item.id);
      return { ...item, views: viewsElement.views }
    });

    res.send({ data: mapped })
  } catch (err) { next(err) }
});

usersRouter.delete('/:id', async (req, res, next) => {
  try {
    const users = await User.destroy({
      where: { id: req.params.id }
    });

    await Views.deleteMany({
      authorId: req.params.id,
    }, (err, result) => {
      if (err) { return console.log(err); }
      return result;
    })

    res.send({ data: users })
  } catch (err) { next(err) }
});

module.exports = usersRouter;