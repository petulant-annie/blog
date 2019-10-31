const User = require('./User');
const Article = require('./Article');
const OauthAccount = require('./oauthaccount');

const models = {
  User,
  Article,
  OauthAccount,
};

Object.values(models).forEach((model) => {
  if (model.associate) { model.associate(models); }
});

module.exports = models;