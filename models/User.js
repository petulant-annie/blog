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
  },
  picture: {
    type: DataTypes.STRING,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  isPro: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  stripeCustomerId: {
    type: DataTypes.STRING,
  },
  stripeCardId: {
    type: DataTypes.STRING,
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
  User.hasMany(models.Comment, {
    as: 'comment',
    foreignKey: 'authorId',
  });
  User.hasOne(models.OauthAccount, {
    as: 'oauth',
    foreignKey: 'userId',
  });
};

module.exports = User;