const express = require('express');
const Sequelize = require('sequelize');
const { check, validationResult } = require('express-validator');
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

commentsRouter.post('/',
  [
    check('content').isString(),
    isLoggedIn,
  ],
  asyncMiddleware(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const newComment = await Comment.create({
      content: req.body.content,
      articleId: req.params.articleId,
      authorId: req.user.id,
    });

    const comment = await Comment.findByPk(
      newComment.authorId, {
        include: [
          { model: User, as: 'author' }
        ],
      });
    req.app.locals.socket.to(`room-${req.params.articleId}`, { action: 'create', data: { comment } });
    res.send({ data: comment });
  }));

commentsRouter.delete('/:id', isLoggedIn, asyncMiddleware(async (req, res) => {
  const comment = await Comment.findOne({ where: { id: req.params.id } })
  await comment.destroy();

  req.app.locals.socket.to(`room-${req.params.articleId}`, { action: 'destroy', data: { comment } });
  res.send({ data: comment })
}));

module.exports = commentsRouter;