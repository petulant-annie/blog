const User = require('./user');
const Article = require('./article');

const models = {
  User,
  Article,
};

Object.values(models).forEach((model) => {
  if (model.associate) { model.associate(models); }
});

module.exports = models;