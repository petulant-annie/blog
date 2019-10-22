const express = require('express');
const mongoose = require('mongoose');
const logger = require('../logger').logger;
const articlesRouter = express.Router();

const { User, Article } = require('../models/index');
const viewsScheme = require('../schemes/viewsScheme');
const Views = mongoose.model('articles_views', viewsScheme);

articlesRouter.get('/', async (req, res) => {
  try {
    logger.info(req, 'get all articles');
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

    res.send({ data: mapped });
  } catch (err) { logger.error(err); }
});

articlesRouter.get('/:id', async (req, res) => {
  try {
    logger.info(req, `get ${req.params.id} article`);
    if (req.params.id.length < 1) {
      res.status(500).send('No such article');
    } else {
      const articlesViews = await Views.findOne({ articleId: req.params.id });

      const article = await Article.findOne({
        include: [{ model: User, as: 'author' }],
        where: { id: req.params.id },
        raw: true,
        nest: true,
      });

      if (articlesViews === null) {
        res.status(500).send('No such article');
      } else {
        const viewsCount = await Views.findOneAndUpdate({
          articleId: req.params.id,
          authorId: article.author.id,
        }, {
          $set: { views: articlesViews.views + 1 }
        }, {
          new: true,
          useNewUrlParser: true
        });
        res.send({ data: { ...article, views: viewsCount.views } });
      }
    }
  } catch (err) { logger.error(err); }
});

articlesRouter.post('/', async (req, res) => {
  try {
    logger.info(req, 'create new article');
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

    res.send({ data: article });
  } catch (err) { logger.error(err); }
});

articlesRouter.put('/:id', async (req, res) => {
  try {
    logger.info(req, `change ${req.params.id} article`);
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

    res.send({ data: article });
  } catch (err) { logger.error(err); }
});

articlesRouter.delete('/:id', async (req, res) => {
  try {
    logger.info(req, `delete ${req.params.id} article`);
    const article = await Article.destroy({
      where: { id: req.params.id }
    });

    await Views.findOneAndRemove({
      articleId: req.params.id,
    }, {
      useNewUrlParser: true
    });

    res.send({ data: article });
  } catch (err) { logger.error(err); }
});

module.exports = articlesRouter;
