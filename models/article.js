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
  publishedAt: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'articles',
  underscored: true,
});

Article.associate = (models) => {
  Article.belongsTo(models.User, { as: 'author' });
};

module.exports = Article;