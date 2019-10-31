const { Model, DataTypes } = require('sequelize');
const sequelize = require('../dbConnection');

class OauthAccount extends Model { }
OauthAccount.init({
  provider: {
    type: DataTypes.STRING,
    allowNull: false
  },
  providerUserId: {
    type: DataTypes.STRING,
    allowNull: false
  },

}, {
  sequelize,
  modelName: 'oauthAccounts',
  timestamps: false,
});

OauthAccount.associate = (models) => {
  OauthAccount.belongsTo(models.User, { as: 'oauthAccounts' });
};

module.exports = OauthAccount;