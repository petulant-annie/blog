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
  underscored: true,
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
};

module.exports = User;