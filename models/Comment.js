const { Model, DataTypes } = require('sequelize');
const sequelize = require('../dbConnection');

class Comment extends Model { }
Comment.init({
  content: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  sequelize,
  modelName: 'comments',
});

Comment.associate = (models) => {
  Comment.belongsTo(models.User, { as: 'user' });
  Comment.belongsTo(models.Article, { as: 'article' });
};
module.exports = Comment;