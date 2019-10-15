const User = require('./user1');
const Article = require('./article1');

const models = {
  User,
  Article,
};

Object.values(models).forEach((model) => {
  if (model.associate) { model.associate(models); }
});

module.exports = models;