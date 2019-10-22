const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const viewsScheme = new Schema({
  articleId: Number,
  authorId: Number,
  views: Number
}, {
  collection: 'articles_views',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
});

module.exports = viewsScheme;