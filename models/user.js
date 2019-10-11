const Sequelize = require('sequelize');
const sequelize = require('../dbConnection');
const Article = require('./article');

const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  articles: {
    type: Sequelize.INTEGER,
  },
});

Article.associate = (models) => {
  Article.belongsTo(models.User, {
    as: 'author',
    foreignKey: 'authorId'
  })
};

module.exports = User;