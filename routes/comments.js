const express = require('express');
const Sequelize = require('sequelize');
const { lt } = Sequelize.Op;
const commentsRouter = express.Router({ mergeParams: true });

const isLoggedIn = require('../config/isLogged');
const asyncMiddleware = require('../asyncMiddleware');
const { User, Comment } = require('../models/index');

const count = 5;

commentsRouter.get('/', asyncMiddleware(async (req, res) => {
  let after = 1e9;
  if (req.query.after) {
    after = req.query.after
  }

  const comment = await Comment.findAll({
    order: [['id', 'DESC']],
    include: [
      { model: User, as: 'author' }
    ],
    where: {
      articleId: req.params.articleId,
      id: { [lt]: after },
    },
    limit: count,
    raw: true,
    nest: true,
  });
  if (comment) {
    res.send({ data: comment });
  } else {
    res.send({ data: {} });
  }
}));

commentsRouter.post('/', isLoggedIn, asyncMiddleware(async (req, res) => {
  await Comment.create({
    content: req.body.content,
    articleId: req.params.articleId,
    authorId: req.user.id,
  });

  const comment = await Comment.findOne({
    include: [
      { model: User, as: 'author' }
    ],
    where: {
      content: req.body.content,
      articleId: req.params.articleId,
      authorId: req.user.id,
    }
  });

  res.send({ data: comment });
}));

commentsRouter.delete('/:id', isLoggedIn, asyncMiddleware(async (req, res) => {
  const comment = await Comment.destroy({ where: { id: req.params.id } });

  res.send({ data: comment })
}));

module.exports = commentsRouter;