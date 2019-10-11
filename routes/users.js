const express = require('express');
const sequelize = require('../dbConnection');
const usersRouter = express.Router();

const { User, Article } = require('../models/index');

usersRouter.get('/', async (req, res, next) => {

  // let articles = await Article.sequelize.query(
  //   'SELECT "id" FROM articles WHERE "authorId" = "id"', {
  //   replacements: ['active'], type: sequelize.QueryTypes.SELECT
  // });

  User.findAll()
    .then(users => res.send({ data: users }))
    .catch(err => next(err))
});

usersRouter.get('/:id', (req, res, next) => {
  User.findAll({ where: { id: req.params.id } })
    .then(user => res.send({ data: user[0] }))
    .catch(err => next(err));
});

usersRouter.post('/', async (req, res, next) => {
  await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  })
    .then(user => res.send({ data: user }))
    .catch(err => next(err));

  await sequelize.sync()
    .catch(err => console.log(err));
});

usersRouter.put('/:id', (req, res, next) => {
  User.update({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  }, {
    where: {
      id: req.params.id
    }
  }).then(user => res.send({ data: user }))
    .catch(err => next(err));
});

usersRouter.get('/:id/blog', (req, res, next) => {
  Article.findAll({
    order: [['id', 'DESC']],
    include: [{ model: User, as: 'author' }],
    where: { authorId: req.params.id }
  })
    .then(article => res.send({ data: article }))
    .catch(err => next(err));
});

usersRouter.delete('/:id', (req, res, next) => {
  User.destroy({
    where: { id: req.params.id }
  })
    .then(users => res.send({ data: users }))
    .catch(err => next(err));
});

module.exports = usersRouter;
