const mongoose = require('mongoose');
const mongooseHistory = require('mongoose-history');
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

const options = {
  customCollectionName: 'articles_history',
  metadata: [
    { key: 'articleId', value:  function (original, newObject) { return newObject.articleId } },
    { key: 'authorId', value: function (original, newObject) { return newObject.authorId } },
    { key: 'viewedAt', value: Date.now() }
  ]
}

module.exports = viewsScheme.plugin(mongooseHistory, options);