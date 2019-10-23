const express = require('express');
const mongoose = require('mongoose');
const articlesRouter = express.Router();

const logger = require('../logger').logger;
const { User, Article } = require('../models/index');
const viewsScheme = require('../schemes/viewsScheme');
const Views = mongoose.model('articles_views', viewsScheme);

articlesRouter.get('/', async (req, res, next) => {
  try {
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
    logger.info('get all articles');

    res.send({ data: mapped });
  } catch (err) { next(err); }
});

articlesRouter.get('/:id', async (req, res, next) => {
  try {
    if (req.params.id.length < 1) {
      throw new Error('no article');
    } else {
      const articlesViews = await Views.findOne({ articleId: req.params.id });

      const article = await Article.findOne({
        include: [{ model: User, as: 'author' }],
        where: { id: req.params.id },
        raw: true,
        nest: true,
      });

      if (articlesViews === null) {
        throw new Error(`there's no ${req.params.id} article`);
      } else {
        const viewsCount = await Views.findOneAndUpdate({
          articleId: req.params.id,
          authorId: article.author.id,
        }, {
          $set: { views: articlesViews.views + 1 }
        }, {
          new: true,
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
        logger.info(`get id:${req.params.id} article`);

        res.send({ data: { ...article, views: viewsCount.views } });
      }
    }
  } catch (err) { next(err); }
});

articlesRouter.post('/', async (req, res, next) => {
  try {
    const article = await Article.create({
      title: req.body.title,
      content: req.body.content,
      authorId: req.body.authorId,
      publishedAt: req.body.publishedAt,
    });

    await Views.create({
      articleId: article.id,
      authorId: article.authorId,
      views: 0,
    });
    logger.info('create new article');

    res.send({ data: article });
  } catch (err) { next(err); }
});

articlesRouter.put('/:id', async (req, res, next) => {
  try {
    const article = await Article.update({
      title: req.body.title,
      content: req.body.content,
      authorId: req.body.authorId,
      publishedAt: req.body.publishedAt,
    }, {
      where: {
        id: req.params.id
      }
    });
    logger.info(`change id:${req.params.id} article`);

    res.send({ data: article });
  } catch (err) { next(err); }
});

articlesRouter.delete('/:id', async (req, res, next) => {
  try {
    const article = await Article.destroy({
      where: { id: req.params.id }
    });

    await Views.findOneAndRemove({
      articleId: req.params.id,
    }, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info(`delete id:${req.params.id} article`);

    res.send({ data: article });
  } catch (err) { next(err); }
});

module.exports = articlesRouter;
