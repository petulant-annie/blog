const Sequelize = require('sequelize');
const sequelize = require('../dbConnection');

const Article = sequelize.define('article', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  content: {
    type: Sequelize.STRING,
    allowNull: false
  },
  publishedAt: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

Article.associate = (models) => {
  Article.belongsTo(models.Users, {
    as: 'author',
    foreignKey: 'authorId'
  })
};

module.exports = Article;