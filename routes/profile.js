const express = require('express');
const profile = express.Router();
const mongoose = require('mongoose');

const { User } = require('../models/index');
const viewsScheme = require('../schemes/viewsScheme');
const Views = mongoose.model('articles_views', viewsScheme);
const { ensureAuthenticated } = require('../config/auth');
const infoLogger = require('../loggers/infoLogger').logger;

profile.put('/', async (req, res, next) => {
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

profile.delete('/', ensureAuthenticated, async (req, res, next) => {
  try {
    const users = await User.destroy({
      where: { id: req.params.id }
    });

    await Views.deleteMany({ authorId: req.params.id });
    infoLogger.info('delete user');

    res.send({ data: users });
  } catch (err) { next(err); }
});

module.exports = profile;