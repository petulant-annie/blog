const { Model, DataTypes } = require('sequelize');
const sequelize = require('../dbConnection');

class User extends Model { }
User.init({
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  sequelize,
  modelName: 'users',
  defaultScope: {
    attributes: {
      exclude: ['password']
    }
  }
});

User.associate = (models) => {
  User.hasMany(models.Article, {
    as: 'article',
    foreignKey: 'authorId',
  });
  User.hasOne(models.OauthAccount, {
    as: 'oauthAccounts',
    foreignKey: 'userId',
  });
};

module.exports = User;