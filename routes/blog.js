const express = require('express');
const articlesRouter = express.Router();
const mongoose = require('mongoose');

const { User, Article, Comment } = require('../models/index');
const viewsScheme = require('../schemes/viewsScheme');
const Views = mongoose.model('articles_views', viewsScheme);
const infoLogger = require('../loggers/infoLogger').logger;
const viewsLogger = require('../loggers/viewsLogger').logger;
const asyncMiddleware = require('../asyncMiddleware');
const google = require('../google-cloud-storage');

articlesRouter.get('/', asyncMiddleware(async (req, res) => {
  const article = await Article.findAll({
    order: [['id', 'DESC']],
    include: [{ model: User, as: 'author' }],
    raw: true,
    nest: true,
  });

  const articlesViews = await Views.find({});
  const mapped = article.map(item => {
    const viewsElement = articlesViews.find(element => element.articleId === item.id);
    return { ...item, views: viewsElement.views }
  });
  infoLogger.info('get all articles');

  res.send({ data: mapped });
}));

articlesRouter.get('/:id', asyncMiddleware(async (req, res) => {
  if (!req.params.id ||
    isNaN(parseInt(req.params.id))) {
    throw new Error('no such article');
  } else {
    const article = await Article.findOne({
      include: [{ model: User, as: 'author' }],
      where: { id: req.params.id },
      raw: true,
      nest: true,
    });

    if (article === null) {
      throw new Error('no article author');
    } else {
      const viewsCount = await Views.findOneAndUpdate({
        articleId: req.params.id,
        authorId: article.author.id,
      }, {
        $inc: { views: 1 }
      }, { new: true });
      viewsLogger.info(`get id:${req.params.id} article`);

      articlesRouter.get('/:id/comments', asyncMiddleware(async (req, res) => {
        const comment = await Comment.findOne({
          include: [
            { model: User, as: 'author' }
          ],
          where: { articleId: req.params.id },
          raw: true,
          nest: true,
        });
        if (comment) {
          res.send({ data: comment });
        } else { res.send({ data: [] }); }
      }));

      articlesRouter.post('/:id/comments', asyncMiddleware(async (req, res) => {
        console.log(req.user.id)
        await Comment.create({
          content: req.body.content,
          articleId: req.params.id,
          authorId: 1,
        }); 
        res.redirect('/:id/comments');
      }))

      res.send({ data: { ...article, views: viewsCount.views } });
    }
  }
}));

articlesRouter.post('/',
  google.upload.single('picture'),
  google.sendUploadToGCS,
  asyncMiddleware(async (req, res) => {
    let pic = '';
    if (req.file && req.file.gcsUrl) {
      pic = req.file.gcsUrl;
    }

    const article = await Article.create({
      title: req.body.title,
      content: req.body.content,
      authorId: req.user.id,
      publishedAt: req.body.publishedAt,
      picture: pic,
    });

    await Views.create({
      articleId: article.id,
      authorId: article.authorId,
      views: 0,
    });
    infoLogger.info('create new article');

    res.send({ data: article });
  }));

articlesRouter.put('/:id',
  google.upload.single('picture'),
  google.sendUploadToGCS,
  asyncMiddleware(async (req, res) => {
    let pic;

    if (req.file && req.file.gcsUrl) {
      pic = req.file.gcsUrl;
    } else if (req.body.picture === '') {
      const article = await Article.findOne({ where: { id: req.params.id } });
      google.deleteFromGCS(article.picture);
      pic = '';
    } else {
      const article = await Article.findOne({ where: { id: req.params.id } });
      pic = article.picture;
    }

    const article = await Article.update({
      title: req.body.title,
      content: req.body.content,
      authorId: req.body.authorId,
      publishedAt: req.body.publishedAt,
      picture: pic,
    }, { where: { id: req.params.id } });
    infoLogger.info(`change id:${req.params.id} article`);

    res.send({ data: article });
  }));

articlesRouter.delete('/:id', asyncMiddleware(async (req, res) => {
  const picture = await Article.findOne({ where: { id: req.params.id } });
  if (picture.picture) {
    google.deleteFromGCS(picture.picture);
  }
  const article = await Article.destroy({ where: { id: req.params.id } });
  await Views.findOneAndRemove({ articleId: req.params.id });
  infoLogger.info(`delete id:${req.params.id} article`);

  res.send({ data: article });
}));

module.exports = articlesRouter;
