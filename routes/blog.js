const express = require('express');
const sequelize = require('../dbConnection');
const articlesRouter = express.Router();

const User = require('../models/user');
const Article = require('../models/article');

articlesRouter.get('/', (req, res, next) => {
  Article.findAll({ raw: true })
    .then(article => res.send({ data: article }))
    .catch(err => next(err))
});

articlesRouter.get('/:id', (req, res, next) => {
  Article.findAll({ where: { id: req.params.id }, raw: true })
    .then(article => res.send({ data: article[0] }))
    .catch(err => next(err));
});

articlesRouter.post('/', async (req, res, next) => {

  User.findAll({ raw: true })
    .then(user => res.send({ data: user }))
    .catch(err => next(err));

  Article.create({
    title: req.body.title,
    content: req.body.content,
    authorId: req.body.authorId,
    publishedAt: req.body.publishedAt,
  })
    .then(article => res.send({ data: article }))
    .catch(err => next(err));

  sequelize.sync()
    .catch(err => console.log(err));
});

articlesRouter.put('/:id', async (req, res, next) => {
  Article.update({
    title: req.body.title,
    content: req.body.content,
    authorId: req.body.authorId,
    publishedAt: req.body.publishedAt,
  }, {
    where: {
      id: req.params.id
    }
  }).then(article => res.send({ data: article }))
    .catch(err => next(err));
});

articlesRouter.delete('/:id', async (req, res, next) => {
  Article.destroy({
    where: {
      id: req.params.id
    }
  }).catch(err => next(err));

  Article.findAll({ raw: true })
    .then(article => res.send({ data: article }))
    .catch(err => next(err));
});

module.exports = articlesRouter;
