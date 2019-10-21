const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const viewsScheme = new Schema({
  articleId: Number,
  authorId: Number,
  views: Number
});

module.exports = viewsScheme;