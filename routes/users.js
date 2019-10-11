const express = require('express');
const sequelize = require('../dbConnection');
const usersRouter = express.Router();

const User = require('../models/user');

usersRouter.get('/', (req, res, next) => {
  User.findAll({ raw: true })
    .then(users => res.send({ data: users }))
    .catch(err => next(err))
});

usersRouter.get('/:id', (req, res, next) => {
  User.findAll({ where: { id: req.params.id }, raw: true })
    .then(user => res.send({ data: user[0] }))
    .catch(err => next(err));
});

usersRouter.post('/', async (req, res, next) => {
  User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  })
    .then(user => res.send({ data: user }))
    .catch(err => next(err));

  sequelize.sync()
    .catch(err => console.log(err));
});

usersRouter.put('/:id', async (req, res, next) => {
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

usersRouter.delete('/:id', async (req, res, next) => {
  User.destroy({
    where: {
      id: req.params.id
    }
  }).catch(err => next(err));

  User.findAll({ raw: true })
    .then(users => res.send({ data: users }))
    .catch(err => next(err));
});

module.exports = usersRouter;
