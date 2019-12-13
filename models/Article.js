const { Model, DataTypes } = require('sequelize');
const sequelize = require('../dbConnection');

class Article extends Model { }
Article.init({
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false
  },
  picture: {
    type: DataTypes.STRING,
  },
  publishedAt: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'articles',
});

Article.associate = (models) => {
  Article.belongsTo(models.User, { as: 'author' });
  Article.hasMany(models.Comment, {
    as: 'comment',
    foreignKey: 'articleId',
  });
};

module.exports = Article;