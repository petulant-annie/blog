const express = require('express');
const articlesRouter = express.Router();

const { User, Article } = require('../models/index');

articlesRouter.get('/', (req, res, next) => {
  Article.findAll({
    order: [['id', 'DESC']],
    include: [{ model: User, as: 'author' }],
  })
    .then(article => res.send({ data: article }))
    .catch(err => next(err))
});

articlesRouter.get('/:id', (req, res, next) => {


  Article.findOne({
    include: [{ model: User, as: 'author' }],
    where: { id: req.params.id }
  })
    .then(article => res.send({ data: article }))
    .catch(err => next(err));
});

articlesRouter.post('/', (req, res, next) => {
  Article.create({
    title: req.body.title,
    content: req.body.content,
    authorId: req.body.authorId,
    publishedAt: req.body.publishedAt,
  })
    .then(article => res.send({ data: article }))
    .catch(err => next(err));
});

articlesRouter.put('/:id', (req, res, next) => {
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

articlesRouter.delete('/:id', (req, res, next) => {
  Article.destroy({
    where: { id: req.params.id }
  })
    .then(article => res.send({ data: article }))
    .catch(err => next(err));
});

module.exports = articlesRouter;
