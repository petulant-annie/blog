const User = require('./User');
const Article = require('./Article');
const OauthAccount = require('./OauthAccount');
const Comment = require('./Comment');

const models = {
  User,
  Article,
  OauthAccount,
  Comment,
};

Object.values(models).forEach((model) => {
  if (model.associate) { model.associate(models); }
});

module.exports = models;